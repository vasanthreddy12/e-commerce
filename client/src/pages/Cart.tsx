import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.ts';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading, error, updateItem, removeItem } = useCart();

  useEffect(() => {
    if (!loading && !error && cart?.items.length === 0) {
      navigate('/products');
    }
  }, [cart?.items.length, loading, error]);

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      await updateItem(productId, quantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.product._id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
            >
              <Link
                to={`/products/${item.product._id}`}
                className="shrink-0 aspect-square w-24 h-24"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover object-center rounded"
                />
              </Link>

              <div className="flex-grow">
                <Link
                  to={`/products/${item.product._id}`}
                  className="text-lg font-medium text-gray-900 hover:text-primary-600"
                >
                  {item.product.name}
                </Link>
                <div className="mt-1 text-sm text-gray-500">
                  Unit Price: ₹{item.price}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      item.product._id,
                      parseInt(e.target.value)
                    )
                  }
                  className="input !w-20"
                >
                  {[...Array(Math.min(10, item.product.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cart.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cart.total > 1000 ? 'Free' : '₹100'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%)</span>
                <span>₹{(cart.total * 0.15).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    ₹
                    {(
                      cart.total +
                      (cart.total > 1000 ? 0 : 100) +
                      cart.total * 0.15
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary w-full">
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="btn btn-secondary w-full"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 