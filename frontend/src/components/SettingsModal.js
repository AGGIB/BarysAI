import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../utils/translations';

const SettingsModal = ({ isOpen, onClose, onLogout, theme, setTheme, language, setLanguage }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'kk');
  const [selectedTheme, setSelectedTheme] = useState(theme || 'light');
  const { t } = useTranslation(selectedLanguage);

  // Обновляем выбранные значения при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setSelectedLanguage(language || 'kk');
      setSelectedTheme(theme || 'light');
      
      // Предотвращаем прокрутку фона при открытом модальном окне
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, language, theme]);

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    
    // Сразу применяем тему
    if (setTheme) {
      console.log('Setting theme to:', newTheme);
      setTheme(newTheme);
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('barysai-theme', newTheme);
    
    // Применяем тему к документу напрямую для мгновенного эффекта
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    
    // Сразу применяем язык
    if (setLanguage) setLanguage(newLang);
    
    // Сохраняем в localStorage
    localStorage.setItem('barysai-language', newLang);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md z-10 mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Секция выбора темы */}
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">{t('theme')}</h3>
                <div className="flex space-x-4">
                  <button 
                    className={`flex-1 py-2 px-3 rounded-md ${selectedTheme === 'light' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      {t('light')}
                    </div>
                  </button>
                  <button 
                    className={`flex-1 py-2 px-3 rounded-md ${selectedTheme === 'dark' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      {t('dark')}
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Секция выбора языка */}
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">{t('language')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    className={`py-2 px-3 rounded-md ${selectedLanguage === 'kk' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'}`}
                    onClick={() => handleLanguageChange('kk')}
                  >
                    Қазақша
                  </button>
                  <button 
                    className={`py-2 px-3 rounded-md ${selectedLanguage === 'ru' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'}`}
                    onClick={() => handleLanguageChange('ru')}
                  >
                    Русский
                  </button>
                  <button 
                    className={`py-2 px-3 rounded-md ${selectedLanguage === 'en' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    English
                  </button>
                </div>
              </div>
              
              {/* Секция выхода из системы */}
              <div className="mt-8">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm11.293 1.293a1 1 0 00-.293.293v2a1 1 0 001 1h2a1 1 0 00.707-1.707l-2-2a1 1 0 00-.707 0z" clipRule="evenodd" />
                  </svg>
                  {t('logout')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal; 