import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios.ts';
import { ReactNode } from 'react';

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  product: {
    _id: string;
    name: string;
    image: string;
  };
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

interface OrderState {
  orders: Order[];
  order: Order | null;
  razorpayOrder: RazorpayOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  order: null,
  razorpayOrder: null,
  loading: false,
  error: null,
};

// Create order
export const createOrder = createAsyncThunk(
  'order/create',
  async (shippingAddress: ShippingAddress) => {
    const response = await axios.post('/api/orders', { shippingAddress });
    return response.data;
  }
);

// Get order by ID
export const getOrder = createAsyncThunk(
  'order/getById',
  async (orderId: string) => {
    const response = await axios.get(`/api/orders/${orderId}`);
    return response.data.order;
  }
);

// Get user's orders
export const getMyOrders = createAsyncThunk('order/getMyOrders', async () => {
  const response = await axios.get('/api/orders/myorders');
  return response.data;
});

// Get all orders (admin)
export const getAllOrders = createAsyncThunk('order/getAllOrders', async () => {
  const response = await axios.get('/api/orders');
  return response.data;
});

// Update order status
export const updateOrder = createAsyncThunk(
  'order/update',
  async ({ orderId, status }: { orderId: string; status: string }) => {
    const response = await axios.put(`/api/orders/${orderId}/status`, { status });
    return response.data;
  }
);

// Create Razorpay order
export const createRazorpayOrder = createAsyncThunk(
  'order/createRazorpayOrder',
  async (orderId: string) => {
    const response = await axios.post(`/api/orders/${orderId}/pay`);
    return response.data;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
    },
    clearRazorpayOrder: (state) => {
      state.razorpayOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create order';
      })

      // Get order by ID
      .addCase(getOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order';
      })

      // Get user's orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })

      // Get all orders (admin)
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })

      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order';
      })

      // Create Razorpay order
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorpayOrder = action.payload;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create payment order';
      });
  },
});

export const { clearOrder, clearRazorpayOrder } = orderSlice.actions;
export default orderSlice.reducer; 