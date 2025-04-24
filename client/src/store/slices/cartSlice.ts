import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState }) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.get('http://localhost:8080/api/cart', {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    return response.data.cart;
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: string; quantity: number }, { getState }) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.post(
      'http://localhost:8080/api/cart',
      { productId, quantity },
      {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      }
    );
    return response.data.cart;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { getState }) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.put(
      `http://localhost:8080/api/cart/${productId}`,
      { quantity },
      {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      }
    );
    return response.data.cart;
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: string, { getState }) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.delete(`http://localhost:8080/api/cart/${productId}`, {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    return response.data.cart;
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState }) => {
    const state = getState() as { auth: { token: string } };
    await axios.delete('http://localhost:8080/api/cart', {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    return null;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add item to cart';
      })
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update cart item';
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove item from cart';
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
      });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer; 