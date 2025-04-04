import React, { useState } from 'react';
import logo from '../assets/LOGO BARYSAI.svg';
import SettingsModal from './SettingsModal';

const Header = ({ onLogout, user, theme, setTheme, language, setLanguage, toggleSidebar }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile toggle button in header */}
            <button
              onClick={toggleSidebar}
              className="md:hidden mr-2 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Открыть меню</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src={logo} alt="BarysAI Logo" />
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">BarysAI</span>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4 hidden sm:block">
                  {user.name || user.email}
                </span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                  <span className="sr-only">Параметрлер</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Модальное окно настроек */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onLogout={onLogout}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
      />
    </header>
  );
};

export default Header; 