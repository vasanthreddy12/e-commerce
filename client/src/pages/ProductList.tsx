import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.ts';

const sortOptions = [
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'rating:desc', label: 'Highest Rated' },
  { value: 'createdAt:desc', label: 'Newest First' },
];

const categories = ['all', 'electronics', 'clothing', 'books', 'home', 'sports', 'other'];

const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, totalPages, currentPage, getProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'rating:desc';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const params: { category?: string; search?: string; sort: string; page: number } = {
      sort,
      page,
    };

    if (category !== 'all') {
      params.category = category;
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    getProducts(params);
  }, [category, sort, page, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      ...Object.fromEntries(searchParams),
      search: searchTerm,
      page: '1',
    });
  };

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      category: newCategory,
      page: '1',
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      sort: e.target.value,
      page: '1',
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
    });
  };

  return (
    <div className="container mx-auto px-4">
      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4 mt-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="input flex-grow"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Category:</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    category === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-700">Sort by:</span>
            <select
              value={sort}
              onChange={handleSortChange}
              className="input !w-auto"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-[150px] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:opacity-75 transition-opacity"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    {product.stock === 0 && (
                      <p className="text-md text-red-600 mb-2">Out of stock</p>
                    )}
                    </div>
                  
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`btn ${
                    pageNum === currentPage
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList; 