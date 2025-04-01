import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AnimatedLoader from './components/AnimatedLoader';

const AnimatedRoutes = ({ isAuthenticated, handleLogin, handleLogout, isLoading, user }) => {
  const location = useLocation();
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    setMessages([
      { sender: 'bot', text: 'BarysAI-ға қош келдіңіз! Мен сізге қалай көмектесе аламын?', timestamp: new Date() }
    ]);
  };

  const handleSendMessage = async (text) => {
    const newMessage = {
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    try {
      const apiKey = 'sk-Xj4_jghXfmh3M_xUqjXDANTltL4Bv0xeWD69q3bk1A24NVKrIWNAVl1kNSd5ROj6OnoU4qCbuYJ4lpKsjMbMNg';
      const apiBody = {
        max_tokens: 1024,
        messages: [
          {
            content: "Сіз BarysAI деп аталасыз. Сіз Қазақстанда жасалған жасанды интеллектсіз. Сіздің жасаушыңыз - Гибатоллаев Ағыбай. Қазақ тілінде жазбаша жауап беріңіз. Егер сұрақ қазақша болмаса, жауабыңызды қазақша беріп, кейін орыс тілінде қайталаңыз. Сіз Қазақстанның тарихы, мәдениеті және тілі туралы мағлұматы бар жасанды интеллект моделісіз.",
            role: "system"
          },
          {
            content: text,
            role: "user"
          }
        ],
        model: "claude-3-haiku-20240307"
      };
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(apiBody)
      };
      
      console.log("Sending request to Langdock API with body:", apiBody);
      
      const response = await fetch('https://api.langdock.com/anthropic/global/v1/messages', options);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('API error response:', responseText, 'Status:', response.status);
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
      }
      
      const data = await response.json();
      console.log("Parsed response from API:", data);
      
      let botResponseText;
      
      if (Array.isArray(data) && data.length > 0 && data[0].content && 
          Array.isArray(data[0].content) && data[0].content.length > 0) {
        botResponseText = data[0].content[0].text;
      } else if (data.content && Array.isArray(data.content) && data.content.length > 0) {
        botResponseText = data.content[0].text;
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error("Could not extract response text from API response");
      }
      
      const botResponse = {
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error getting response from API:', error);
      
      const errorResponse = {
        sender: 'bot',
        text: 'Кешіріңіз, сұранысты өңдеу кезінде қате орын алды. Кейінірек қайталап көріңіз. Техникалық ақпарат: ' + error.message,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    }
  };

  const handleCreateNewChat = () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: 'Жаңа әңгіме',
      timestamp: new Date()
    };
    
    setChats(prevChats => [newChat, ...prevChats]);
    setActiveChat(newChat.id);
    setMessages([
      { sender: 'bot', text: 'BarysAI-ға қош келдіңіз! Жаңа сөйлесуді бастадыңыз. Мен сізге қалай көмектесе аламын?', timestamp: new Date() }
    ]);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <AnimatedLoader />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex flex-col h-screen">
                <Header onLogout={handleLogout} user={user} />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar
                    chats={chats}
                    onChatSelect={handleChatSelect}
                    activeChat={activeChat}
                    onCreateNewChat={handleCreateNewChat}
                  />
                  <div className="flex-1">
                    <ChatArea
                      messages={messages}
                      onSendMessage={handleSendMessage}
                    />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('http://localhost:5001/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <AnimatedRoutes
        isAuthenticated={isAuthenticated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        isLoading={isLoading}
        user={user}
      />
    </Router>
  );
}

export default App;
