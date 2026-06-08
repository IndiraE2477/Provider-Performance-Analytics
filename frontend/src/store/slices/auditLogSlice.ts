import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuditLogQueryParams } from '../../types';

interface AuditLogSliceState {
  filters: AuditLogQueryParams;
}

const initialState: AuditLogSliceState = {
  filters: {
    search: '',
    actionType: '',
    entityName: '',
    sortBy: 'Timestamp',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10,
  },
};

const auditLogSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    setAuditLogFilters(state, action: PayloadAction<Partial<AuditLogQueryParams>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setAuditLogSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setAuditLogPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    setAuditLogSorting(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
      state.filters.page = 1;
    },
    resetAuditLogFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const { setAuditLogFilters, setAuditLogSearch, setAuditLogPage, setAuditLogSorting, resetAuditLogFilters } = auditLogSlice.actions;
export const selectAuditLogFilters = (state: { auditLogs: AuditLogSliceState }) => state.auditLogs.filters;

export default auditLogSlice.reducer;
