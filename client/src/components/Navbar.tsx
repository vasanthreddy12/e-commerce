import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white py-4">
                        <div className="container mx-auto px-4">
        <Link to="/" className="text-2xl font-bold">
          E-Commerce App
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

