import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';

const Home: React.FC = () => {
  const { products, loading, getProducts } = useProducts();

  useEffect(() => {
    getProducts({ sort: 'rating:desc', limit: 8 });
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Our E-Commerce Store
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Discover amazing products at great prices. Shop now and enjoy exclusive deals!
            </p>
            <Link
              to="/products"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['electronics', 'clothing', 'books', 'home', 'sports', 'other'].map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="bg-gray-100 rounded-lg p-6 text-center hover:bg-gray-200 transition-colors"
              >
                <span className="capitalize text-lg font-medium">{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:opacity-75 transition-opacity"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                          ₹{product.price}
                        </span>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 text-sm text-gray-600">
                            {product.rating} ({product.numReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 