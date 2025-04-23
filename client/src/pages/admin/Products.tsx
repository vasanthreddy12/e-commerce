import React, { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts.ts';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

const AdminProducts: React.FC = () => {
  const { products, loading, error, addProduct, editProduct, removeProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    stock: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      stock: 0
    });
    setEditingProduct(null);
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        stock: product.stock
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await editProduct(editingProduct._id, formData);
      } else {
        await addProduct(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await removeProduct(productId);
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Image</th>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Category</th>
              <th className="table-header-cell">Price</th>
              <th className="table-header-cell">Stock</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {products?.map((product: any) => (
              <tr key={product._id}>
                <td className="table-body-cell">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="table-body-cell">{product.name}</td>
                <td className="table-body-cell">{product.category}</td>
                <td className="table-body-cell">${product.price}</td>
                <td className="table-body-cell">{product.stock}</td>
                <td className="table-body-cell space-x-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="label">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="label">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price" className="label">Price</label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category" className="label">Category</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Fashion</option>
                  <option value="home">Home</option>
                  <option value="books">Books</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="image" className="label">Image URL</label>
                <input
                  type="url"
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="stock" className="label">Stock</label>
                <input
                  type="number"
                  id="stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="input"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 