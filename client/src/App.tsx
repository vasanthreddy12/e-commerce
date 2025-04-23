import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useInitAuth } from './hooks/useInitAuth.ts';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ProductList from './pages/ProductList.tsx';
import ProductDetails from './pages/ProductDetails.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import OrderSuccess from './pages/OrderSuccess.tsx';
import Profile from './pages/Profile.tsx';
import Orders from './pages/Orders.tsx';
import OrderDetails from './pages/OrderDetails.tsx';
import AdminDashboard from './pages/admin/Dashboard.tsx';
import AdminProducts from './pages/admin/Products.tsx';
import AdminOrders from './pages/admin/Orders.tsx';
import NotFound from './pages/NotFound.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';

const App: React.FC = () => {
  const { isInitialized } = useInitAuth();

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
   
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
  );
};

export default App; 