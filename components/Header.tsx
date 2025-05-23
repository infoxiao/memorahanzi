
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 shadow-lg">
      <h1 className="text-4xl font-bold text-white text-center tracking-tight">{title}</h1>
      <p className="text-center text-indigo-200 mt-1">Your companion for remembering Chinese names.</p>
    </header>
  );
};
