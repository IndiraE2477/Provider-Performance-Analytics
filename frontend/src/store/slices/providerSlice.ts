import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProviderQueryParams } from '../../types';

interface ProviderFilters extends ProviderQueryParams {}

interface ProviderSliceState {
  filters: ProviderFilters;
  selectedProviderId: number | null;
}

const initialState: ProviderSliceState = {
  filters: {
    search: '',
    specialty: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    pageSize: 10,
  },
  selectedProviderId: null,
};

const providerSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ProviderFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    setSorting(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
      state.filters.page = 1;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    setSelectedProvider(state, action: PayloadAction<number | null>) {
      state.selectedProviderId = action.payload;
    },
  },
});

export const { setFilters, setSearch, setPage, setSorting, resetFilters, setSelectedProvider } = providerSlice.actions;
export const selectProviderFilters = (state: { providers: ProviderSliceState }) => state.providers.filters;
export const selectSelectedProviderId = (state: { providers: ProviderSliceState }) => state.providers.selectedProviderId;

export default providerSlice.reducer;
