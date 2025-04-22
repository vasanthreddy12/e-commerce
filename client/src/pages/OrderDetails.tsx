import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { useAuth } from '../hooks/useAuth';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { order, loading, error, getOrder, updateOrderStatus } = useOrder();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (id) {
      getOrder(id);
    }
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (id) {
      try {
        await updateOrderStatus(id, newStatus);
        getOrder(id); // Refresh order details
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/orders" className="text-primary-600 hover:text-primary-900">
          ← Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Order #{order._id}</h1>
                <p className="text-gray-600">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.status as keyof typeof statusColors]
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
                {isAdmin && (
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="block mt-2 input !w-auto"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 bg-gray-50 rounded-lg p-4"
                  >
                    <img
                      src={item.product.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <Link
                        to={`/products/${item.product._id}`}
                        className="font-medium hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price}</p>
                      <p className="text-sm text-gray-600">
                        Total: ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Address:</span>{' '}
                {order.shippingAddress.address}
              </p>
              <p>
                <span className="font-medium">City:</span>{' '}
                {order.shippingAddress.city}
              </p>
              <p>
                <span className="font-medium">Postal Code:</span>{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>
                <span className="font-medium">Country:</span>{' '}
                {order.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.itemsPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%)</span>
                <span>₹{order.taxPrice}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {order.isPaid ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                <p className="font-medium">Paid</p>
                <p className="text-sm">
                  Paid on{' '}
                  {new Date(order.paidAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                <p className="font-medium">Payment Pending</p>
              </div>
            )}

            {order.isDelivered && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                <p className="font-medium">Delivered</p>
                <p className="text-sm">
                  Delivered on{' '}
                  {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 