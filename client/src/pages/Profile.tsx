import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrder } from '../hooks/useOrder';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { orders, loading, error, fetchMyOrders } = useOrder();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Type</label>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Member Since</label>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              <Link to="/orders" className="text-primary-600 hover:text-primary-500">
                View All Orders
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order._id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.totalPrice}</p>
                        <p
                          className={`text-sm mt-1 ${
                            order.status === 'delivered'
                              ? 'text-green-600'
                              : order.status === 'cancelled'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-600">
                No orders found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 