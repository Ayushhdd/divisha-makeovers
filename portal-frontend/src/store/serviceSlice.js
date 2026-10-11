import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchServices = createAsyncThunk(
  'services/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/services', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchAllServices = createAsyncThunk(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/services/all');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState: {
    list: [],
    all: [],
    loading: false,
    error: null,
    selected: [],
  },
  reducers: {
    toggleService: (state, action) => {
      const id = action.payload._id;
      const idx = state.selected.findIndex((s) => s._id === id);
      if (idx >= 0) state.selected.splice(idx, 1);
      else state.selected.push({ ...action.payload, quantity: 1 });
    },
    setServiceQuantity: (state, action) => {
      const service = state.selected.find(item => item._id === action.payload.id);
      const quantity = Number(action.payload.quantity);
      if (service && Number.isInteger(quantity) && quantity >= 1 && quantity <= 100) service.quantity = quantity;
    },
    clearSelected: (state) => {
      state.selected = [];
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => { state.loading = true; })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllServices.fulfilled, (state, action) => {
        state.all = action.payload;
      });
  },
});

export const { toggleService, clearSelected, setSelected, setServiceQuantity } = serviceSlice.actions;
export default serviceSlice.reducer;
