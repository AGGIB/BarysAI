import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ chats, onChatSelect, activeChat, onCreateNewChat, onDeleteChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredChats = searchQuery.trim() === '' 
    ? chats 
    : chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  const handleSettingsClick = () => {
    alert('Настройки қызметі әзірге қолжетімді емес');
  };

  return (
    <div className="w-64 h-full bg-gray-900 text-white overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Сөйлесулер</h2>
          <button 
            onClick={handleSettingsClick}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
            title="Параметрлер"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Іздеу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <button 
          onClick={onCreateNewChat}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
        >
          + Жаңа әңгіме
        </button>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        {filteredChats.length > 0 ? (
          <ul className="space-y-1">
            {filteredChats.map((chat) => (
              <li 
                key={chat.id} 
                className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-800 ${activeChat === chat.id ? 'bg-gray-800' : ''}`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex-1 truncate mr-2">
                  {chat.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="p-1 rounded hover:bg-gray-600 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {searchQuery.trim() !== '' ? 'Іздеу нәтижелері табылмады' : 'Сөйлесу тарихы бос'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 