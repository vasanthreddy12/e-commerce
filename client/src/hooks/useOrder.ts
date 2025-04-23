import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch, RootState } from '../store';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrder,
  createRazorpayOrder,
} from '../store/slices/orderSlice.ts';
import { useAuth } from './useAuth.ts';
import { loadRazorpayScript, createRazorpayOptions, initializeRazorpayPayment } from '../utils/razorpay.ts';

export const useOrder = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    orders,
    order,
    loading,
    error,
    razorpayOrder,
  } = useSelector((state: RootState) => state.order);
  const { user } = useAuth();

  const createNewOrder = useCallback(async (shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) => {
    const result = await dispatch(createOrder(shippingAddress)).unwrap();
    return result;
  }, [dispatch]);

  const getOrderById = useCallback(async (orderId: string) => {
    const result = await dispatch(getOrder(orderId)).unwrap();
    return result;
  }, [dispatch]);

  const fetchMyOrders = useCallback(async () => {
    const result = await dispatch(getMyOrders()).unwrap();
    return result;
  }, [dispatch]);

  const fetchAllOrders = useCallback(async () => {
    const result = await dispatch(getAllOrders()).unwrap();
    return result;
  }, [dispatch]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    const result = await dispatch(updateOrder({ orderId, status })).unwrap();
    return result;
  }, [dispatch]);

  const processPayment = useCallback(async (orderId: string) => {
    const result = await dispatch(createRazorpayOrder(orderId)).unwrap();
    return result;
  }, [dispatch]);

  return {
    orders,
    order,
    loading,
    error,
    razorpayOrder,
    createNewOrder,
    getOrder: getOrderById,
    fetchMyOrders,
    fetchAllOrders,
    updateOrderStatus,
    processPayment,
  };
}; 