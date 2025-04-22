import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../store/slices/cartSlice';
import { useAuth } from './useAuth';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading, error } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const addItem = async (productId: string, quantity: number) => {
    try {
      await dispatch(addToCart({ productId, quantity })).unwrap();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const updateItem = async (productId: string, quantity: number) => {
    try {
      await dispatch(updateCartItem({ productId, quantity })).unwrap();
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const clearCartItems = async () => {
    try {
      await dispatch(clearCart()).unwrap();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  return {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCartItems,
    itemCount: cart?.items.length || 0,
    total: cart?.total || 0,
  };
}; 