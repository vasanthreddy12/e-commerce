import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  numReviews: number;
}

interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: ProductState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params: { page?: number; category?: string; search?: string; sort?: string }) => {
    const { page = 1, category, search, sort } = params;
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    if (sort) queryParams.append('sort', sort);
    queryParams.append('page', page.toString());

    const response = await axios.get(
      `http://localhost:5000/api/products?${queryParams.toString()}`
    );
    return response.data;
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id: string) => {
    const response = await axios.get(`http://localhost:5000/api/products/${id}`);
    return response.data.product;
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData: Omit<Product, '_id'>, { getState }) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.post('http://localhost:5000/api/products', productData, {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    return response.data.product;
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, productData }: { id: string; productData: Partial<Product> }, { getState }) => {
    const state = getState() as { auth: { token: string } };
    const response = await axios.put(`http://localhost:5000/api/products/${id}`, productData, {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    return response.data.product;
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id: string, { getState }) => {
    const state = getState() as { auth: { token: string } };
    await axios.delete(`http://localhost:5000/api/products/${id}`, {
      headers: { Authorization: `Bearer ${state.auth.token}` },
    });
    return id;
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    clearProduct: (state) => {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.product?._id === action.payload._id) {
          state.product = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
        if (state.product?._id === action.payload) {
          state.product = null;
        }
      });
  },
});

export const { clearProductError, clearProduct } = productSlice.actions;
export default productSlice.reducer; 