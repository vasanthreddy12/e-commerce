import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.ts';

const Home:   React.FC =  () => {
  const { products, loading, error } =  useProducts();
  const featuredProducts = products?.slice(0, 6) || [];

  const categories = [
    { name: 'Electronics', image: '/images/electronics.jpg' },
    { name: 'Clothing', image: '/images/fashion.jpg' },
    { name: 'Home', image: '/images/home.jpg' },
    { name: 'Books', image: '/images/books.jpg' },
    { name: 'Sports', image: '/images/sports.jpg' },
    { name: 'Other', image: '/images/other.jpeg' }
  ];

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Welcome to Our E-Commerce Store</h1>
            <p className="text-lg mb-8">Discover amazing products at great prices</p>
            <Link to="/products" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group relative rounded-lg overflow-hidden shadow-md aspect-w-16 aspect-h-9"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div key={product._id} className="card group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[200px] object-cover object-center group-hover:scale-105 transition-transform duration-200"
                 />
                </div>
                <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${product.price}</span>
                  <Link
                    to={`/products/${product._id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/products" className="btn btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-6">
              Stay updated with our latest products and offers
            </p>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 