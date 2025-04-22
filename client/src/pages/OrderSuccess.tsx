import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const OrderSuccess: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircleIcon className="h-24 w-24 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Order Placed Successfully!
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Thank you for your purchase. We'll send you a confirmation email with your
          order details.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/orders" className="btn btn-primary">
            View Orders
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 