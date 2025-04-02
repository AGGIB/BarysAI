import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import barysLogo from '../assets/LOGO BARYSAI.svg';
import DotTypingAnimation from './DotTypingAnimation';
import { useTranslation } from '../utils/translations';

// Message component with markdown support
const Message = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-opacity duration-300`}
    >
      <div 
        className={`max-w-[90%] sm:max-w-[75%] p-3 rounded-lg ${
          isUser 
            ? 'bg-indigo-600 text-white' 
            : message.isError
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-white text-gray-800 border border-gray-200'
        }`}
      >
        {isUser ? (
          <p className="break-words whitespace-pre-wrap">{message.text}</p>
        ) : message.isThinking ? (
          <div className="flex items-center space-x-1">
            <DotTypingAnimation />
          </div>
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

const ChatArea = ({ messages, onSendMessage, isGenerating, language }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const { t } = useTranslation(language);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() !== '' && !isGenerating) {
      onSendMessage(inputText);
      setInputText('');
      // Сбрасываем высоту textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Автоматическая прокрутка при обновлении сообщений
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Автоматическое изменение высоты textarea
  const handleTextAreaInput = (e) => {
    const target = e.target;
    setInputText(target.value);
    
    // Сначала сбрасываем высоту, чтобы получить правильную высоту содержимого
    target.style.height = 'auto';
    // Затем устанавливаем высоту основываясь на scrollHeight
    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
  };

  // Эффект для первоначальной настройки высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
        {/* Removed duplicate BarysAI title */}
      </div>
      
      <div 
        ref={messageContainerRef}
        className="flex-1 p-3 sm:p-4 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center max-w-md p-4 sm:p-8 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-gray-900 dark:text-white">{t('welcome')}</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {t('welcomeMessage')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[90%] sm:max-w-3xl rounded-lg p-3 sm:p-4 shadow ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : message.isError
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {message.isThinking ? (
                    <div className="h-6 flex items-center">
                      <DotTypingAnimation />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm sm:text-base">
                      {message.text.split('```').map((part, i) => {
                        // Если это нечетная часть (0, 2, 4...), это обычный текст
                        if (i % 2 === 0) {
                          return (
                            <span key={i}>
                              {part}
                            </span>
                          );
                        } 
                        // Если это четная часть (1, 3, 5...), это код
                        else {
                          // Проверяем, есть ли указание языка
                          const codeLines = part.split('\n');
                          const language = codeLines[0].trim();
                          const code = codeLines.slice(1).join('\n');
                          
                          return (
                            <div 
                              key={i} 
                              className={`my-2 sm:my-3 p-2 sm:p-3 rounded bg-gray-800 dark:bg-gray-900 text-gray-100 font-mono text-xs sm:text-sm overflow-x-auto`}
                            >
                              {language && (
                                <div className="text-xs text-gray-400 mb-1 sm:mb-2">{language}</div>
                              )}
                              {code || part}
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleTextAreaInput}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage')}
              disabled={isGenerating}
              className="w-full py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[44px] max-h-[200px] placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
              rows="1"
            />
          </div>
          <button
            type="submit"
            disabled={inputText.trim() === '' || isGenerating}
            className={`p-2 sm:p-3 rounded-lg flex-shrink-0 focus:outline-none ${
              inputText.trim() === '' || isGenerating
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea; 