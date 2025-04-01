import React from 'react';
import barysLogo from '../assets/LOGO BARYSAI.svg';

const Header = ({ onLogout, user }) => {
  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src={barysLogo} 
            alt="BarysAI Logo" 
            className="h-8 w-8 mr-2" 
          />
          <h1 className="text-xl font-bold">BarysAI</h1>
        </div>
        <nav>
          <ul className="flex space-x-4 items-center">
            {user && (
              <li className="flex items-center mr-4">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2">
                  <span className="text-sm font-semibold">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
              </li>
            )}
            {onLogout && (
              <li>
                <button 
                  onClick={onLogout}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Шығу
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 