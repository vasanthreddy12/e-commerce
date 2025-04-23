import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.ts';
import { useCart } from '../hooks/useCart.ts';
import { useAuth } from '../hooks/useAuth.ts';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error, getProduct } = useProducts();
  const { addItem, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      getProduct(id);
    }
  }, [id]);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product) {
      try {
        await addItem(product._id, quantity);
        navigate('/cart');
      } catch (error) {
        console.error('Failed to add item to cart:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-8">Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-w-1 aspect-h-1 bg-white rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full  object-fit object-center"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm text-gray-600">
                  {product.rating} ({product.numReviews} reviews)
                </span>
              </div>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm text-gray-600">
                Category: <span className="capitalize">{product.category}</span>
              </span>
            </div>
          </div>

          <div className="text-2xl font-bold text-gray-900">₹{product.price}</div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <label htmlFor="quantity" className="mr-4 text-gray-700">
                Quantity:
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                className="input !w-24"
                disabled={product.stock === 0}
              >
                {[...Array(Math.min(10, product.stock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center text-sm">
              <span
                className={`${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} units in stock`
                  : 'Out of stock'}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || cartLoading}
              className="btn btn-primary w-full"
            >
              {cartLoading
                ? 'Adding to Cart...'
                : product.stock === 0
                ? 'Out of Stock'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 