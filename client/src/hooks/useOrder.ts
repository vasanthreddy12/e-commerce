import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrder,
  createRazorpayOrder,
} from '../store/slices/orderSlice';
import { useAuth } from './useAuth';
import { loadRazorpayScript, createRazorpayOptions, initializeRazorpayPayment } from '../utils/razorpay';

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

  const createNewOrder = async (shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) => {
    const result = await dispatch(createOrder(shippingAddress)).unwrap();
    return result;
  };

  const getOrderById = async (orderId: string) => {
    const result = await dispatch(getOrder(orderId)).unwrap();
    return result;
  };

  const fetchMyOrders = async () => {
    const result = await dispatch(getMyOrders()).unwrap();
    return result;
  };

  const fetchAllOrders = async () => {
    const result = await dispatch(getAllOrders()).unwrap();
    return result;
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const result = await dispatch(updateOrder({ orderId, status })).unwrap();
    return result;
  };

  const processPayment = async (orderId: string) => {
    const result = await dispatch(createRazorpayOrder(orderId)).unwrap();
    return result;
  };

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