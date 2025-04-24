import React, { useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useDispatch } from 'react-redux';
import { clearOrder } from '../store/slices/orderSlice.ts';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const formatPrice = (price: number | undefined) => {
  if (typeof price !== 'number') return '₹0.00';
  return `₹${price.toFixed(2)}`;
};

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { order, loading, error, getOrder, updateOrderStatus } = useOrder();
  const { isAdmin } = useAuth();
  const dispatch = useDispatch();

  const fetchOrder = useCallback(async () => {
    if (id) {
      await getOrder(id);
    }
  }, [id, getOrder]);

  useEffect(() => {
    fetchOrder();
    return () => {
      dispatch(clearOrder());
    };
  }, [fetchOrder, dispatch]);

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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link to="/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderStatus = order.status || 'pending';
  const statusColor = statusColors[orderStatus as keyof typeof statusColors] || statusColors.pending;

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
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                {isAdmin ? (
                  <select
                    value={orderStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className={`block mt-2 input  px-3 py-1 rounded-full  !w-auto ${statusColor}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ):<div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
              </div>}
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-bold mb-4">Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 bg-gray-50 rounded-lg p-4"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={item.product?.image || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.png';
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <Link
                        to={`/products/${item.product?._id}`}
                        className="font-medium hover:text-primary-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-600">
                        Total: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <p className="text-gray-600 text-center py-4">No items found in this order</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Address:</span>{' '}
                {order.shippingAddress?.address || 'N/A'}
              </p>
              <p>
                <span className="font-medium">City:</span>{' '}
                {order.shippingAddress?.city || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Postal Code:</span>{' '}
                {order.shippingAddress?.postalCode || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Country:</span>{' '}
                {order.shippingAddress?.country || 'N/A'}
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
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : formatPrice(Number(order.shipping))}</span>
              </div>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%)</span>
                <span>{formatPrice(Number(order.tax))}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </div>

            {order.isPaid ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                <p className="font-medium">Paid</p>
                {order.paidAt && (
                  <p className="text-sm">
                    Paid on {formatDate(order.paidAt)}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                <p className="font-medium">Payment Pending</p>
                <p className="text-sm">Cash on Delivery</p>
              </div>
            )}

            {order.isDelivered && order.deliveredAt && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                <p className="font-medium">Delivered</p>
                <p className="text-sm">
                  Delivered on {formatDate(order.deliveredAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default OrderDetails;