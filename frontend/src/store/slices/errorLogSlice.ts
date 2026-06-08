import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ErrorLogQueryParams } from '../../types';

interface ErrorLogSliceState {
  filters: ErrorLogQueryParams;
}

const initialState: ErrorLogSliceState = {
  filters: {
    search: '',
    method: '',
    statusCode: undefined,
    sortBy: 'Timestamp',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10,
  },
};

const errorLogSlice = createSlice({
  name: 'errorLogs',
  initialState,
  reducers: {
    setErrorLogFilters(state, action: PayloadAction<Partial<ErrorLogQueryParams>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setErrorLogSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setErrorLogPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    setErrorLogSorting(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
      state.filters.page = 1;
    },
    resetErrorLogFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const { setErrorLogFilters, setErrorLogSearch, setErrorLogPage, setErrorLogSorting, resetErrorLogFilters } = errorLogSlice.actions;
export const selectErrorLogFilters = (state: { errorLogs: ErrorLogSliceState }) => state.errorLogs.filters;

export default errorLogSlice.reducer;
