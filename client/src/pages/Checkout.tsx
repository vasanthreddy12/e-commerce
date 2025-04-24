import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.ts';
import { useAuth } from '../hooks/useAuth.ts';
import axios from 'axios';

interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCartItems } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'online'>('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = cart.total;
  const shipping = subtotal > 1000 ? 0 : 100;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async (orderId: string) => {
    const res = await initializeRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load');
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: total * 100, // Amount in paise
      currency: 'INR',
      name: 'E-Commerce Store',
      description: 'Purchase Payment',
      order_id: orderId,
      handler: async (response: any) => {
        try {
          await axios.post(
            'http://localhost:8080/api/orders/verify-payment',
            {
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          await clearCartItems();
          navigate('/order-success');
        } catch (error) {
          setError('Payment verification failed');
        }
      },
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: {
        color: '#3B82F6',
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create order
      const orderData = {
        items: cart.items,
        shippingAddress,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        total,
      };
      const response = await axios.post(
        'http://localhost:8080/api/orders',
        orderData,
        {
            headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (paymentMethod === 'online') {
        // If online payment, initialize Razorpay
        await handleOnlinePayment(response.data.order.razorpayOrderId);
      } else {
        // If COD, clear cart and redirect
        await clearCartItems();
        navigate('/order-success');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Address Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Shipping Address</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingAddress.address}
                onChange={handleAddressChange}
                required
                className="input mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  required
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  required
                  className="input mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  required
                  className="input mt-1"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  required
                  className="input mt-1"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    id="COD"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => {
                      setPaymentMethod('COD');
                    }}
                    className="radio"
                  />
                  <label htmlFor="COD" className="text-sm font-medium text-gray-700">
                    Cash on Delivery
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    id="online"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => {
                      setPaymentMethod('online');
                    }}
                    className="radio"
                  />
                  <label htmlFor="online" className="text-sm font-medium text-gray-700">
                    Pay Online (Razorpay)
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm mt-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-6"
            >
              {loading ? 'Processing...' : `Place Order (₹${total.toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.product._id} className="flex gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ₹{item.price}
                    </p>
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (15%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 