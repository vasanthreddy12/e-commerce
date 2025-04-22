import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useProducts } from '../../hooks/useProducts';
import { productSchema } from '../../utils/validation';

interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  stock: string;
}

const AdminProducts: React.FC = () => {
  const {
    products,
    loading,
    error,
    getProducts,
    addProduct,
    editProduct,
    removeProduct,
  } = useProducts();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getProducts({});
  }, []);

  const handleAddProduct = async (values: ProductFormValues, { resetForm }: any) => {
    try {
      await addProduct({
        ...values,
        price: Number(values.price),
        stock: Number(values.stock)
      });
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleEditProduct = async (values: ProductFormValues, { resetForm }: any) => {
    try {
      if (editingProduct?._id) {
        await editProduct(editingProduct._id, {
          ...values,
          price: Number(values.price),
          stock: Number(values.stock)
        });
        resetForm();
        setEditingProduct(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to edit product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await removeProduct(productId);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          Add New Product
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products?.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rating: {product.rating} ({product.numReviews} reviews)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : product.stock < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <Formik<ProductFormValues>
              initialValues={
                editingProduct || {
                  name: '',
                  description: '',
                  price: '',
                  category: '',
                  image: '',
                  stock: '',
                }
              }
              validationSchema={productSchema}
              onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="label">
                      Product Name
                    </label>
                    <Field
                      id="name"
                      name="name"
                      type="text"
                      className="input mt-1"
                    />
                    {errors.name && touched.name && (
                      <p className="mt-1 text-sm text-red-600">{String(errors.name)}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="label">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={3}
                      className="input mt-1"
                    />
                    {errors.description && touched.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {String(errors.description)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="label">
                        Price
                      </label>
                      <Field
                        id="price"
                        name="price"
                        type="number"
                        className="input mt-1"
                      />
                      {errors.price && touched.price && (
                        <p className="mt-1 text-sm text-red-600">{String(errors.price)}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stock" className="label">
                        Stock
                      </label>
                      <Field
                        id="stock"
                        name="stock"
                        type="number"
                        className="input mt-1"
                      />
                      {errors.stock && touched.stock && (
                        <p className="mt-1 text-sm text-red-600">{String(errors.stock)}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="label">
                      Category
                    </label>
                    <Field
                      as="select"
                      id="category"
                      name="category"
                      className="input mt-1"
                    >
                      <option value="">Select a category</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="books">Books</option>
                      <option value="home">Home</option>
                      <option value="sports">Sports</option>
                      <option value="other">Other</option>
                    </Field>
                    {errors.category && touched.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {String(errors.category)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="image" className="label">
                      Image URL
                    </label>
                    <Field
                      id="image"
                      name="image"
                      type="text"
                      className="input mt-1"
                    />
                    {errors.image && touched.image && (
                      <p className="mt-1 text-sm text-red-600">{String(errors.image)}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : editingProduct
                        ? 'Save Changes'
                        : 'Add Product'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 