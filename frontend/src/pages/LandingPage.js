import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../assets/LOGO BARYSAI.svg';
import { useTranslation } from '../utils/translations';

const LandingPage = ({ language, setLanguage }) => {
  const { t } = useTranslation(language);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Локальные переводы для лендинга
  const landingTranslations = {
    slogan: {
      kk: 'Қазақстанның алғашқы ИИ көмекшісі',
      ru: 'Первый ИИ ассистент Казахстана',
      en: 'The first AI assistant of Kazakhstan'
    },
    description: {
      kk: 'BarysAI - бұл қазақ, орыс және ағылшын тілдерінде сұрақтарға жауап беретін жасанды интеллект көмекшісі. Білім алу, кеңес алу немесе жай ғана сөйлесу үшін қолдануға болады.',
      ru: 'BarysAI - это помощник на базе искусственного интеллекта, отвечающий на вопросы на казахском, русском и английском языках. Используйте его для обучения, получения советов или просто для общения.',
      en: 'BarysAI is an artificial intelligence assistant that answers questions in Kazakh, Russian, and English. Use it for learning, getting advice, or just having a conversation.'
    },
    createdBy: {
      kk: 'Жасаған: Гибатоллаев Ағыбай',
      ru: 'Разработано: Гибатоллаев Агыбай',
      en: 'Created by: Gibatollayev Agybai'
    },
    madeIn: {
      kk: 'Қазақстанда жасалған',
      ru: 'Сделано в Казахстане',
      en: 'Made in Kazakhstan'
    },
    login: {
      kk: 'Кіру',
      ru: 'Войти',
      en: 'Log in'
    },
    register: {
      kk: 'Тіркелу',
      ru: 'Регистрация',
      en: 'Register'
    },
    tryNow: {
      kk: 'Қазір көру',
      ru: 'Попробовать сейчас',
      en: 'Try now'
    },
    chooseLanguage: {
      kk: 'Тілді таңдаңыз',
      ru: 'Выберите язык',
      en: 'Choose language'
    },
    developerInfo: {
      kk: 'Әзірлеуші туралы',
      ru: 'О разработчике',
      en: 'About developer'
    },
    college: {
      kk: 'AITU колледжі',
      ru: 'Колледж AITU',
      en: 'AITU College'
    },
    group: {
      kk: 'БҚ-2309 тобы',
      ru: 'Группа БҚ-2309',
      en: 'Group BK-2309'
    },
    city: {
      kk: 'Астана қаласы',
      ru: 'город Астана',
      en: 'Astana city'
    }
  };

  const lt = (key) => landingTranslations[key]?.[language] || key;

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 300);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('barysai-language', lang);
    setShowLanguageMenu(false);
  };

  // Анимация для фоновых элементов
  const backgroundVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Фоновая анимация */}
      <div className="fixed inset-0">
        <svg className="w-full h-full opacity-5" viewBox="0 0 100 100">
          <motion.path
            d="M0,50 Q25,0 50,50 T100,50"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            variants={backgroundVariants}
            initial="initial"
            animate="animate"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="30"
            stroke="white"
            strokeWidth="0.2"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </svg>
      </div>

      {/* Навигация */}
      <nav className="relative z-10 pt-4 sm:pt-6 px-4 sm:px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center">
              <img 
                src={logo} 
                alt="BarysAI Logo" 
                className="w-6 h-6 sm:w-8 sm:h-8"
                onError={() => setLogoError(true)}
              />
            </div>
            <motion.h1 
              className="text-2xl sm:text-3xl font-light tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              BarysAI
            </motion.h1>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Выбор языка */}
            <div className="relative">
              <motion.button
                className="w-full sm:w-auto px-4 py-2 text-sm border border-white/20 rounded-full hover:bg-white/5 transition-all"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'kk' ? 'Қазақша' : language === 'ru' ? 'Русский' : 'English'}
              </motion.button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-40 bg-black border border-white/20 rounded-lg overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {['kk', 'ru', 'en'].map((lang) => (
                      <motion.button
                        key={lang}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-all ${
                          language === lang ? 'text-white' : 'text-white/70'
                        }`}
                        onClick={() => handleLanguageChange(lang)}
                        whileHover={{ x: 5 }}
                      >
                        {lang === 'kk' ? 'Қазақша' : lang === 'ru' ? 'Русский' : 'English'}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Кнопки входа/регистрации */}
            <motion.div 
              className="flex items-center gap-3 sm:gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link 
                to="/login"
                className="w-28 sm:w-auto text-center px-4 sm:px-6 py-2 text-sm border border-white/20 rounded-full hover:bg-white/5 transition-all"
              >
                {lt('login')}
              </Link>
              <Link 
                to="/register"
                className="w-28 sm:w-auto text-center px-4 sm:px-6 py-2 text-sm bg-white text-black rounded-full hover:bg-white/90 transition-all"
              >
                {lt('register')}
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center md:text-left"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-6 sm:mb-8">
              {lt('slogan')}
            </h2>
            <p className="text-base sm:text-lg text-white/70 mb-8 sm:mb-12 max-w-lg mx-auto md:mx-0">
              {lt('description')}
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all text-sm sm:text-base"
            >
              <span>{lt('tryNow')}</span>
              <motion.svg 
                className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
                initial={{ x: 0 }}
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
              </motion.svg>
            </Link>
          </motion.div>

          <div className="relative mt-8 md:mt-0">
            <motion.div
              className="relative aspect-square max-w-[300px] sm:max-w-[400px] mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.div 
                className="absolute inset-0 border border-white/20 rounded-full"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              <motion.div 
                className="absolute inset-4 border border-white/30 rounded-full"
                animate={{ 
                  rotate: -360,
                  scale: [1.1, 1, 1.1]
                }}
                transition={{ 
                  rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                  scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {!logoError ? (
                  <motion.img 
                    src={logo} 
                    alt="BarysAI Logo" 
                    className="w-32 h-32 filter brightness-0 invert"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <motion.div 
                    className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="text-white text-4xl font-light">B</span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 px-4 sm:px-6 py-2 sm:py-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-xs sm:text-sm font-light">{lt('madeIn')}</p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col border-t border-white/10 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
            <motion.p 
              className="text-white/50 text-xs sm:text-sm mb-4 sm:mb-0 text-center sm:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              {lt('createdBy')}
            </motion.p>
            <motion.div 
              className="flex space-x-4 sm:space-x-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </motion.div>
          </div>
          
          <motion.div 
            className="border-t border-white/10 pt-6 sm:pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <h3 className="text-white/70 text-base sm:text-lg mb-4 text-center sm:text-left">{lt('developerInfo')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-white/50 text-xs sm:text-sm">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Гибатоллаев Ағыбай</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{lt('college')}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{lt('city')}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{lt('group')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 