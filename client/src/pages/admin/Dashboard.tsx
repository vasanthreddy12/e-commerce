import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts.ts';
import { useOrder } from '../../hooks/useOrder.ts';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: any[];
  topProducts: any[];
}

const AdminDashboard: React.FC = () => {
  const { products, getProducts } = useProducts();
  const { orders, fetchAllOrders } = useOrder();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: [],
  });

  useEffect(() => {
    getProducts({});
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (products && orders) {
      const lowStockThreshold = 10;
      const lowStockCount = products.filter(
        (product) => product.stock < lowStockThreshold
      ).length;

      const revenue = orders.reduce(
        (total, order) => total + order.totalPrice,
        0
      );

      // Get recent orders (last 5)
      const recent = [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      // Calculate product sales and sort by quantity
      const productSales = new Map();
      orders.forEach((order) => {
        order.items.forEach((item) => {
          const currentSales = productSales.get(item.product._id) || 0;
          productSales.set(item.product._id, currentSales + item.quantity);
        });
      });

      const topSelling = products
        .map((product) => ({
          ...product,
          totalSales: productSales.get(product._id) || 0,
        }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      setStats({
        totalOrders: orders.length,
        totalRevenue: revenue,
        totalProducts: products.length,
        lowStockProducts: lowStockCount,
        recentOrders: recent,
        topProducts: topSelling,
      });
    }
  }, [products, orders]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{stats.totalRevenue}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Low Stock Alert</h3>
          <p className="text-3xl font-bold">{stats.lowStockProducts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-primary-600 hover:text-primary-900 text-sm"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Order #{order._id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.totalPrice}</p>
                    <p
                      className={`text-sm ${
                        order.status === 'delivered'
                          ? 'text-green-600'
                          : order.status === 'cancelled'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Top Selling Products</h2>
            <Link
              to="/admin/products"
              className="text-primary-600 hover:text-primary-900 text-sm"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.topProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-4 bg-gray-50 rounded-lg p-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-grow">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.totalSales} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{product.price}</p>
                  <p className="text-sm text-gray-600">
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 