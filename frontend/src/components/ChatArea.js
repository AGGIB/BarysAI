import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import barysLogo from '../assets/LOGO BARYSAI.svg';

// Simple dot typing animation component
const DotTypingAnimation = () => {
  return (
    <div className="flex items-center space-x-1 p-3 rounded-lg bg-white text-gray-800 border border-gray-200 max-w-xs shadow-sm">
      <div className="flex space-x-1.5">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-dot1"></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-dot2"></div>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-dot3"></div>
      </div>
    </div>
  );
};

const Message = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-opacity duration-300`}
    >
      <div 
        className={`max-w-[75%] p-3 rounded-lg ${
          isUser 
            ? 'bg-indigo-600 text-white' 
            : 'bg-white text-gray-800 border border-gray-200'
        }`}
      >
        {isUser ? (
          <p className="break-words whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown 
              components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0 break-words" {...props} />,
                a: ({node, ...props}) => <a className="text-indigo-600 hover:underline" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline 
                    ? <code className="bg-gray-100 px-1 rounded text-sm" {...props} />
                    : <code className="block bg-gray-100 p-2 rounded text-sm overflow-x-auto my-2" {...props} />
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatArea = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle typing indicator when messages change
  useEffect(() => {
    // If a new message was added and it's from the bot, turn off typing indicator
    if (messages.length > prevMessagesLengthRef.current && 
        messages[messages.length - 1].sender === 'bot') {
      setIsTyping(false);
    }
    
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      // Show typing indicator before bot response
      setIsTyping(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 relative">
      <div className="p-4 border-b border-gray-200 bg-white z-10">
        <h1 className="text-xl font-semibold text-gray-800">BarysAI</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {isTyping && (
              <div className="py-2 flex justify-start">
                <DotTypingAnimation />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center relative">
            <img 
              src={barysLogo} 
              alt="BarysAI" 
              className="w-24 h-24 mb-6"
            />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              BarysAI-ға қош келдіңіз
            </h2>
            <p className="text-gray-600 max-w-md">
              Қазақстандық жасанды интеллект көмекшісімен сөйлесуді бастаңыз
            </p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-white z-10">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Хабарламаңызды жазыңыз..."
            className="flex-1 bg-gray-100 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-r-md"
          >
            Жіберу
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea; 