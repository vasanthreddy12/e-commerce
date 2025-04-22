import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../store/slices/productSlice.ts';

export const useProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, product, loading, error, totalPages, currentPage } = useSelector(
    (state: RootState) => state.product
  );

  const getProducts = async (params: {
    page?: number;
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    try {
      await dispatch(fetchProducts(params)).unwrap();
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  };

  const getProduct = async (id: string) => {
    try {
      await dispatch(fetchProductById(id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  };

  const addProduct = async (productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
  }) => {
    try {
      await dispatch(createProduct(productData)).unwrap();
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  };

  const editProduct = async (id: string, productData: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    stock?: number;
  }) => {
    try {
      await dispatch(updateProduct({ id, productData })).unwrap();
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  return {
    products,
    product,
    loading,
    error,
    totalPages,
    currentPage,
    getProducts,
    getProduct,
    addProduct,
    editProduct,
    removeProduct,
  };
}; 