// Глобальный словарь переводов для интерфейса
export const translations = {
  settings: {
    kk: 'Параметрлер',
    ru: 'Настройки',
    en: 'Settings'
  },
  theme: {
    kk: 'Тақырып',
    ru: 'Тема',
    en: 'Theme'
  },
  light: {
    kk: 'Ақшыл',
    ru: 'Светлая',
    en: 'Light'
  },
  dark: {
    kk: 'Күңгірт',
    ru: 'Темная',
    en: 'Dark'
  },
  language: {
    kk: 'Тіл',
    ru: 'Язык',
    en: 'Language'
  },
  logout: {
    kk: 'Шығу',
    ru: 'Выйти',
    en: 'Log out'
  },
  search: {
    kk: 'Іздеу',
    ru: 'Поиск',
    en: 'Search'
  },
  conversations: {
    kk: 'Сөйлесулер',
    ru: 'Беседы',
    en: 'Conversations'
  },
  newChat: {
    kk: 'Жаңа әңгіме',
    ru: 'Новый чат',
    en: 'New chat'
  },
  noChats: {
    kk: 'Әңгімелер табылмады',
    ru: 'Беседы не найдены',
    en: 'No conversations found'
  },
  typeMessage: {
    kk: 'Сұрағыңызды жазыңыз...',
    ru: 'Напишите ваш вопрос...',
    en: 'Type your message...'
  },
  welcome: {
    kk: 'BarysAI-ға қош келдіңіз',
    ru: 'Добро пожаловать в BarysAI',
    en: 'Welcome to BarysAI'
  },
  welcomeMessage: {
    kk: 'Бұл жаңа әңгіме. Сұрақ қойыңыз немесе бірдеңе жазыңыз.',
    ru: 'Это новый чат. Задайте вопрос или напишите что-нибудь.',
    en: 'This is a new conversation. Ask a question or write something.'
  }
};

// Функция для получения перевода по ключу и текущему языку
export const getTranslation = (key, language) => {
  if (!translations[key]) {
    console.warn(`Ключ перевода не найден: ${key}`);
    return key;
  }
  return translations[key][language] || key;
};

// Создаем хук для простого использования переводов в компонентах
export const useTranslation = (language) => {
  return {
    t: (key) => getTranslation(key, language)
  };
}; 