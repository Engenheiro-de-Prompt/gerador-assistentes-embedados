
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-white hover:text-cyan-400 transition-colors">
          Assistant Proxy Generator
        </Link>
      </nav>
    </header>
  );
};

export default Header;
