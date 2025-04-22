import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="text-lg text-gray-600 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 