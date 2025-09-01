
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 shadow-lg">
      <div className="container mx-auto flex items-center justify-center">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          TYO Try Your Own
        </h1>
      </div>
    </header>
  );
};

export default Header;
