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
import DotTypingAnimation from './components/DotTypingAnimation';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import LandingPage from './pages/LandingPage';

// Animated Routes component for transitions
const AnimatedRoutes = ({ isAuthenticated, isAdmin, handleLogin, handleLogout, isLoading, user }) => {
  const location = useLocation();
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('barysai-theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('barysai-language') || 'kk');
  // Add state for sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when chat is selected on mobile
  const handleMobileChatSelect = (chatId) => {
    handleChatSelect(chatId);
    // Close sidebar automatically on mobile after selecting a chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Применяем тему при загрузке и изменении
  useEffect(() => {
    // Убедимся, что при загрузке приложения тема применяется сразу
    const savedTheme = localStorage.getItem('barysai-theme') || 'light';
    
    console.log('Applying theme:', savedTheme);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []); // [] чтобы эффект выполнился только при монтировании

  // Добавим отдельный эффект для отслеживания изменений темы
  useEffect(() => {
    console.log('Theme changed to:', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Сохраняем тему в localStorage
    localStorage.setItem('barysai-theme', theme);
  }, [theme]);

  // Инициализация активного чата при загрузке компонента
  useEffect(() => {
    // При загрузке страницы создаем новый чат, если нет активного и если список чатов пуст
    if (!activeChat && chats.length === 0) {
      handleCreateNewChat();
    }
  }, [chats.length]); // Зависим от длины списка чатов, чтобы не создавать дубликаты

  // Если приложение загружается и это первая загрузка, загружаем чаты
  useEffect(() => {
    if (isAuthenticated) {
      // Загружаем историю чатов
      loadChatHistory();
    }
  }, [isAuthenticated]);

  // Функция загрузки истории чатов
  const loadChatHistory = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/chats', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.chats && data.chats.length > 0) {
          // Проверяем формат чатов и корректируем при необходимости
          const processedChats = data.chats.map(chat => {
            // Убедимся, что каждый чат имеет корректную структуру
            return {
              id: chat.id || chat.chat_id, // Поддержка разных форматов ID
              title: chat.title || 'Жаңа әңгіме', // Используем существующее название или дефолтное
              timestamp: chat.timestamp || chat.created_at || new Date()
            };
          });
          
          console.log('Loaded chats from server:', processedChats);
          
          setChats(processedChats);
          // Устанавливаем активным первый чат из истории
          setActiveChat(processedChats[0].id);
        } else {
          // Если чатов нет, создаем новый
          handleCreateNewChat();
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // В случае ошибки создаем новый чат
      handleCreateNewChat();
    }
  };

  // Handle chat selection
  const handleChatSelect = (chatId) => {
    if (activeChat === chatId) return; // Не делаем ничего, если уже выбран этот чат
    
    setActiveChat(chatId);
    setMessages([]); // Очищаем сообщения, пока не загрузились новые
    
    // Загрузка сообщений для выбранного чата произойдет через useEffect
  };

  // Handle sending a message
  const handleSendMessage = async (text) => {
    // Проверка минимальной длины запроса
    if (text.trim().length < 2) {
      setMessages(prevMessages => [...prevMessages, {
        sender: 'bot',
        text: 'Пожалуйста, введите более развернутый запрос для получения корректного ответа.\n\nҚұрметті пайдаланушы, толығырақ сұрау енгізіңіз.',
        timestamp: new Date(),
        isError: true
      }]);
      return;
    }
    
    // Блокируем отправку новых сообщений
    setIsGenerating(true);
    
    const newMessage = {
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Если у чата стандартное название "Жаңа әңгіме", генерируем новое название
    const currentChat = chats.find(chat => chat.id === activeChat);
    if (currentChat && currentChat.title === 'Жаңа әңгіме') {
      try {
        // Добавляем запрос на генерацию названия
        const titleGenerationBody = {
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [
            {
              role: "system",
              content: "Сіз BarysAI қазақ тіліндегі көмекші боттысыз. Пайдаланушы хабарламасына негізделген қысқа чат атауын жасаңыз (4-5 сөзден аспайтын). Чат атауы МІНДЕТТІ ТҮРДЕ ҚАЗАҚ ТІЛІНДЕ болуы керек, тіпті егер пайдаланушы хабарламасы басқа тілде болса да. Жауабыңызды ТЕК ҚАНА атаумен шектеңіз, ешқандай қосымша түсіндірмелер немесе белгілер қоспаңыз."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.4,
          max_tokens: 50
        };

        const titleResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'BarysAI'
          },
          body: JSON.stringify(titleGenerationBody)
        });

        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          const chatTitle = titleData.choices[0].message.content.trim();
          
          // Обновляем название чата локально
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === activeChat
                ? { ...chat, title: chatTitle }
                : chat
            )
          );

          // Сохраняем название чата в базе данных
          if (isAuthenticated) {
            await fetch(`http://localhost:5001/api/chats/${activeChat}/update-title`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                title: chatTitle
              })
            });
          }
        }
      } catch (error) {
        console.error('Error generating chat title:', error);
      }
    }
    
    // Add a "thinking" message that will be replaced with the actual response
    const thinkingMessageId = Date.now();
    setMessages(prevMessages => [...prevMessages, {
      id: thinkingMessageId,
      sender: 'bot',
      text: '...',
      timestamp: new Date(),
      isThinking: true
    }]);

    // Сохраняем сообщение пользователя в базе данных, только если пользователь аутентифицирован
    if (isAuthenticated) {
      try {
        await fetch('http://localhost:5001/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            chatId: activeChat,
            sender: 'user',
            text: text,
            timestamp: new Date()
          })
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    } else {
      // Гостевой режим
      try {
        await fetch('http://localhost:5001/api/guest/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chatId: activeChat,
            sender: 'user',
            text: text,
            timestamp: new Date()
          })
        });
      } catch (error) {
        console.error('Error with guest message:', error);
      }
    }
    
    // Set a global timeout for the entire operation
    const globalTimeoutId = setTimeout(() => {
      // Check if the thinking message is still there and replace it
      setMessages(prevMessages => {
        const stillThinking = prevMessages.some(msg => msg.id === thinkingMessageId && msg.isThinking);
        if (stillThinking) {
          // Разблокируем интерфейс в случае таймаута
          setIsGenerating(false);
          return prevMessages.map(msg => 
            msg.id === thinkingMessageId 
              ? {
                  ...msg,
                  text: 'Кешіріңіз, жауап алу тым көп уақыт алады. API қызметі қол жетімсіз болуы мүмкін.\n\nИзвините, получение ответа занимает слишком много времени. Сервис API может быть недоступен.',
                  isThinking: false,
                  isError: true
                }
              : msg
          );
        }
        return prevMessages;
      });
    }, 60000); // 60 second timeout
    
    try {
      // OpenRouter API request format
      const openRouterApiBody = {
        model: "deepseek/deepseek-chat-v3-0324:free", // Меняем на новую модель DeepSeek
        messages: [
          {
            role: "system",
            content: "Сіз BarysAI қазақ тіліндегі көмекші боттысыз. Пайдаланушыға қысқа және нақты жауап беріңіз. Қазақ тілінде жауап беру - бірінші басымдылық, бірақ орыс және ағылшын тілдерін де қолдайсыз. Егер сұрақ қазақша болмаса, жауабыңызды қазақша беріп, кейін сұрақ тілінде қайталаңыз. Сандар, код, формулалар, математикалық өрнектер және басқа арнайы форматтауды дұрыс көрсете аласыз. Кодты код блоктарына бөліп жазыңыз, математикалық формулаларды нақты форматтаңыз, кестелерді тегіс етіп көрсетіңіз. Егер сізді кім жасағаны туралы сұраса, Гибатоллаев Ағыбай сіздің жасаушыңыз екенін айтыңыз."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      };
      
      const openRouterOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BarysAI'
        },
        body: JSON.stringify(openRouterApiBody)
      };
      
      // Define API endpoints to try
      const endpoints = [
        'https://openrouter.ai/api/v1/chat/completions',
        'https://api.openrouter.ai/api/v1/chat/completions' // Alternate domain as backup
      ];
      
      console.log("Отправка запроса в OpenRouter API:", openRouterApiBody);
      
      let response = null;
      let responseText = null;
      let endpointSuccess = false;
      
      // Try each endpoint until one succeeds
      for (const endpoint of endpoints) {
        try {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
          
          // Make the request with timeout
          console.log(`Попытка запроса к: ${endpoint} - ${new Date().toISOString()}`);
          
          response = await fetch(endpoint, {
            ...openRouterOptions,
            signal: controller.signal
          }).catch(error => {
            console.error(`Ошибка fetch запроса к ${endpoint}:`, error);
            if (error.name === 'AbortError') {
              throw new Error(`Таймаут запроса к ${endpoint} после 45 секунд ожидания`);
            }
            throw error;
          });
          
          // Clear fetch timeout since request completed
          clearTimeout(timeoutId);
          console.log(`Запрос к ${endpoint} завершен: ${new Date().toISOString()}`);
          
          // Get response as text first for debugging
          responseText = await response.text();
          
          console.log(`Получен ответ от API [${response.status}] ${endpoint}: ${responseText.substring(0, 300)}...`);
          
          // If we got here without errors, break the loop
          endpointSuccess = true;
          break;
        } 
        catch (error) {
          console.warn(`Endpoint ${endpoint} failed:`, error.message);
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed
      if (!endpointSuccess) {
        throw new Error('Все доступные API endpoints недоступны. Пожалуйста, попробуйте позже.');
      }
      
      // If first attempt failed, try with Gemini as backup
      if (!response.ok && response.status !== 401 && response.status !== 403) {
        console.log("Первый запрос не удался, пробуем Gemini модель...");
        
        // Try with Gemini model
        const backupApiBody = {
          model: "google/gemini-2.5-pro-exp-03-25:free", // Используем Gemini как запасной вариант
          messages: [
            {
              role: "system",
              content: "Сіз BarysAI қазақ тіліндегі көмекші боттысыз. Пайдаланушыға қысқа және нақты жауап беріңіз. Қазақ тілінде жауап беру - бірінші басымдылық, бірақ орыс және ағылшын тілдерін де қолдайсыз. Егер сұрақ қазақша болмаса, жауабыңызды қазақша беріп, кейін сұрақ тілінде қайталаңыз. Сандар, код, формулалар, математикалық өрнектер және басқа арнайы форматтауды дұрыс көрсете аласыз. Кодты код блоктарына бөліп жазыңыз, математикалық формулаларды нақты форматтаңыз, кестелерді тегіс етіп көрсетіңіз. Егер сізді кім жасағаны туралы сұраса, Гибатоллаев Ағыбай сіздің жасаушыңыз екенін айтыңыз."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.5,
          max_tokens: 600
        };
        
        const backupOptions = {
          ...openRouterOptions,
          body: JSON.stringify(backupApiBody)
        };
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for backup
        
        try {
          console.log("Резервный запрос с моделью Gemini: " + new Date().toISOString());
          
          // Make request with the backup model
          const backupEndpoint = endpoints[0]; // Use primary endpoint
          response = await fetch(backupEndpoint, {
            ...backupOptions,
            signal: controller.signal
          });
          
          // Clear fetch timeout
          clearTimeout(timeoutId);
          
          // Get response as text
          responseText = await response.text();
          console.log(`Получен ответ от API (резервная модель) [${response.status}]: ${responseText.substring(0, 300)}...`);
        } 
        catch (error) {
          console.error("Ошибка при использовании резервной модели:", error);
          // Continue with the original response and let the error handling below handle it
        }
      }
      
      // Если возникла ошибка или пустой ответ от API, показываем сообщение пользователю
      if (!response.ok || responseText.trim() === '' || responseText === '{}') {
        // Собираем информацию для диагностики
        const diagnosticInfo = {
          status: response?.status,
          statusText: response?.statusText,
          responseText: responseText?.substring(0, 500) || 'Empty response',
          headers: Object.fromEntries([...response.headers.entries()])
        };
        
        console.error("API error diagnostic info:", diagnosticInfo);
        
        // Показываем уведомление об ошибке
        throw new Error(`Provider returned error. Статус: ${response.status}`);
      }
      
      // Parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON response:", e, "Raw response:", responseText);
        
        // Если получен некорректный JSON, проверяем, может быть это простой текстовый ответ
        if (typeof responseText === 'string' && responseText.length > 10) {
          // Используем просто текстовый ответ
          const botResponseText = responseText;
          
          // Clear the global timeout since we got a response
          clearTimeout(globalTimeoutId);
          
          // Replace the thinking message with the actual response
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === thinkingMessageId
                ? {
                    id: Date.now(), // new ID to trigger re-render
                    sender: 'bot',
                    text: botResponseText,
                    timestamp: new Date()
                  }
                : msg
            )
          );
          
          return; // Завершаем обработку, чтобы избежать дальнейших проверок
        }
        
        throw new Error(`Недействительный формат ответа от API: ${e.message}. Возможно, API вернул некорректные данные.`);
      }
      
      console.log("Распарсенный ответ от API:", data);
      
      // Extract the response text - OpenRouter format
      let botResponseText;
      
      console.log("Тип данных ответа:", typeof data);
      console.log("Структура данных ответа:", Object.keys(data).join(", "));
      
      // Более гибкая обработка разных форматов ответа
      if (data.choices && data.choices.length > 0) {
        // Стандартный формат OpenRouter
        if (data.choices[0].message && data.choices[0].message.content) {
          botResponseText = data.choices[0].message.content;
          console.log("Получен ответ в стандартном формате OpenRouter");
        } 
        // Альтернативный формат для некоторых моделей
        else if (data.choices[0].text) {
          botResponseText = data.choices[0].text;
          console.log("Получен ответ в альтернативном формате (choices[0].text)");
        }
        // Gemini иногда возвращает content напрямую
        else if (data.choices[0].content) {
          botResponseText = data.choices[0].content;
          console.log("Получен ответ в формате Gemini (choices[0].content)");
        }
      } 
      // Проверяем другие возможные форматы
      else if (data.message && data.message.content) {
        botResponseText = data.message.content;
        console.log("Получен ответ в формате message.content");
      }
      else if (data.content) {
        // Gemini может вернуть content напрямую
        botResponseText = data.content;
        console.log("Получен ответ с прямым content");
      }
      else if (data.text) {
        // Некоторые модели возвращают просто text
        botResponseText = data.text;
        console.log("Получен ответ с прямым text");
      }
      else if (data.response) {
        // Fallback на response
        botResponseText = data.response;
        console.log("Получен ответ с полем response");
      }
      else if (data.generated_text) {
        // Некоторые модели используют generated_text
        botResponseText = data.generated_text;
        console.log("Получен ответ с полем generated_text");
      }
      else {
        // Попытка найти текст в любом поле ответа
        console.log("Поиск ответа в любом поле...");
        let foundText = false;
        
        // Рекурсивная функция для поиска текстового поля
        const findTextInObject = (obj, depth = 0) => {
          if (depth > 3) return null; // Ограничение глубины поиска
          
          if (typeof obj === 'string' && obj.length > 10) {
            return obj;
          }
          
          if (obj && typeof obj === 'object') {
            // Приоритетные поля для проверки
            const priorityFields = ['content', 'text', 'message', 'response', 'generated_text'];
            
            for (const field of priorityFields) {
              if (obj[field] && typeof obj[field] === 'string' && obj[field].length > 10) {
                console.log(`Найдено текстовое поле: ${field}`);
                return obj[field];
              }
              
              if (obj[field] && typeof obj[field] === 'object') {
                const result = findTextInObject(obj[field], depth + 1);
                if (result) return result;
              }
            }
            
            // Проверяем все остальные поля
            for (const key in obj) {
              if (!priorityFields.includes(key)) {
                if (typeof obj[key] === 'string' && obj[key].length > 10) {
                  console.log(`Найдено текстовое поле: ${key}`);
                  return obj[key];
                }
                
                if (typeof obj[key] === 'object') {
                  const result = findTextInObject(obj[key], depth + 1);
                  if (result) return result;
                }
              }
            }
          }
          
          return null;
        };
        
        botResponseText = findTextInObject(data);
        
        if (botResponseText) {
          foundText = true;
          console.log("Найден текст в произвольном поле объекта ответа");
        }
        
        if (!foundText) {
          // В крайнем случае, преобразуем весь объект в строку
          if (typeof data === 'object') {
            console.error('Не удалось найти текст ответа в JSON. Вывод полной структуры для диагностики:', JSON.stringify(data, null, 2));
          }
          
          throw new Error(`Ответ API не содержит ожидаемого содержимого в формате OpenRouter. Пожалуйста, свяжитесь с администратором для диагностики.`);
        }
      }
      
      // Check if we actually got a response
      if (!botResponseText) {
        console.error('Текст ответа пустой, полные данные:', data);
        throw new Error('API вернул пустой ответ');
      }
      
      console.log("Финальный извлеченный текст ответа:", botResponseText.substring(0, 100) + "...");
      
      // Сохраняем ответ бота в базе данных, только если пользователь аутентифицирован
      if (isAuthenticated) {
        try {
          await fetch('http://localhost:5001/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              chatId: activeChat,
              sender: 'bot',
              text: botResponseText,
              timestamp: new Date()
            })
          });
        } catch (error) {
          console.error('Error saving bot message:', error);
        }
      } else {
        // Гостевой режим
        try {
          await fetch('http://localhost:5001/api/guest/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chatId: activeChat,
              sender: 'bot',
              text: botResponseText,
              timestamp: new Date()
            })
          });
        } catch (error) {
          console.error('Error with guest bot message:', error);
        }
      }
      
      // Finish processing - keep this at all exit points
      setIsGenerating(false);
      // Clear the global timeout since we got a response
      clearTimeout(globalTimeoutId);
      
      // Replace the thinking message with the actual response
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === thinkingMessageId
            ? {
                id: Date.now(),
                sender: 'bot',
                text: botResponseText,
                timestamp: new Date()
              }
            : msg
        )
      );
    } catch (error) {
      // Clear the global timeout since we have an error to display
      clearTimeout(globalTimeoutId);
      // Разблокируем интерфейс в случае ошибки
      setIsGenerating(false);
      
      console.error('Error getting response from API:', error);
      
      // Determine error message based on type
      let userErrorMessage;
      
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('network') ||
          error.message.includes('подключ') ||
          error.message.includes('интернет') ||
          error.message.includes('Таймаут')) {
        userErrorMessage = `Кешіріңіз, интернет байланысы ақаулы болуы мүмкін. Желіні тексеріп, қайта көріңіз.\n\nПожалуйста, проверьте подключение к интернету и попробуйте снова.`;
      } else if (error.message.includes('API ключ') || 
                error.message.includes('авторизац') || 
                error.message.includes('401') || 
                error.message.includes('403')) {
        userErrorMessage = `Кешіріңіз, API кілтімен проблема бар. Әкімшіге хабарласыңыз.\n\nПроблема с ключом API. Пожалуйста, сообщите администратору.`;
      } else if (error.message.includes('Превышен лимит') || 
                error.message.includes('429')) {
        userErrorMessage = `Кешіріңіз, сұраныстар саны шектелген. Біраз уақыттан кейін қайталап көріңіз.\n\nПревышен лимит запросов. Пожалуйста, попробуйте позже.`;
      } else if (error.message.includes('Invalid JSON') || 
                error.message.includes('Недействительный') || 
                error.message.includes('формат')) {
        userErrorMessage = `Кешіріңіз, API қызметінен жауап форматында қате бар. Әкімшіге хабарласыңыз.\n\nОшибка в формате ответа от сервиса API. Пожалуйста, сообщите администратору.`;
      } else {
        userErrorMessage = `Кешіріңіз, сұранысты өңдеу кезінде қате орын алды. Кейінірек қайталап көріңіз.\n\nПроизошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.`;
      }
      
      // Replace the thinking message with the error message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === thinkingMessageId
            ? {
                ...msg,
                text: `${userErrorMessage}\n\nТехническая информация: ${error.message || 'Unknown error'}`,
                isThinking: false,
                isError: true
              }
            : msg
        )
      );
    }
  };

  // Load messages for active chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) return;
      
      try {
        setMessages([]); // Сначала очищаем сообщения, чтобы избежать мигания старых
        
        const response = await fetch(`http://localhost:5001/api/messages/${activeChat}`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    loadMessages();
  }, [activeChat]);

  // Handle creating a new chat
  const handleCreateNewChat = () => {
    // Избегаем создания дубликатов пустых чатов
    if (activeChat && messages.length === 0) {
      return;
    }
    
    const newChat = {
      id: `chat-${Date.now()}`,
      title: 'Жаңа әңгіме',
      timestamp: new Date()
    };
    
    setChats(prevChats => [newChat, ...prevChats]);
    setActiveChat(newChat.id);
    setMessages([]);
    
    // Сохраняем в базе данных асинхронно, если аутентифицирован
    if (isAuthenticated) {
      saveNewChatToDatabase(newChat);
    }
  };
  
  // Асинхронное сохранение нового чата в базе данных
  const saveNewChatToDatabase = async (chat) => {
    try {
      await fetch('http://localhost:5001/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          chatId: chat.id,
          title: chat.title,
          timestamp: chat.timestamp
        })
      });
    } catch (error) {
      console.error('Error saving new chat to database:', error);
    }
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/chats/${chatId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        if (activeChat === chatId) {
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Show loading screen if in loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <AnimatedLoader />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <LandingPage language={language} setLanguage={setLanguage} />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/chat" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/chat" replace />
            ) : (
              <RegisterPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/admin-login"
          element={
            isAdmin ? <Navigate to="/admin" replace /> : <AdminLogin />
          }
        />
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminPanel />
            ) : (
              <Navigate to="/admin-login" replace />
            )
          }
        />
        <Route
          path="/chat"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
                  <Header 
                    onLogout={handleLogout} 
                    user={user} 
                    theme={theme} 
                    setTheme={setTheme} 
                    language={language} 
                    setLanguage={setLanguage}
                    toggleSidebar={toggleSidebar}
                  />
                  <div className="flex flex-1 overflow-hidden relative">
                    {/* Overlay for mobile when sidebar is open */}
                    {isSidebarOpen && (
                      <div 
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                        onClick={() => setIsSidebarOpen(false)}
                      />
                    )}
                    
                    {/* Sidebar with mobile responsive classes */}
                    <div 
                      className={`
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                        md:translate-x-0 
                        fixed md:relative z-20 
                        h-[calc(100vh-64px)] md:h-full top-[64px] md:top-0 left-0 
                        transition-transform duration-300 ease-in-out
                        md:w-64 w-[80%] max-w-xs
                      `}
                    >
                      <Sidebar
                        chats={chats}
                        onChatSelect={handleMobileChatSelect}
                        activeChat={activeChat}
                        onCreateNewChat={handleCreateNewChat}
                        onDeleteChat={handleDeleteChat}
                        language={language}
                      />
                    </div>
                    
                    <div className="flex-1 md:ml-0 w-full">
                      <ChatArea
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isGenerating={isGenerating}
                        language={language}
                      />
                    </div>
                  </div>
                </div>
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already logged in on page load
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
          
          // Check if user is admin
          if (data.user.role === 'admin') {
            setIsAdmin(true);
          }
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
    // Simulate loading after login attempt
    setTimeout(async () => {
      try {
        // Get user info after login
        const response = await fetch('http://localhost:5001/api/user', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Check if user is admin
          if (data.user.role === 'admin') {
            setIsAdmin(true);
          }
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
      setIsAdmin(false);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <AnimatedRoutes
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        isLoading={isLoading}
        user={user}
      />
    </Router>
  );
}

export default App;
