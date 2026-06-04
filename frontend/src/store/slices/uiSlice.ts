import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiSliceState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  globalLoading: boolean;
}

const initialState: UiSliceState = {
  sidebarCollapsed: false,
  activeModal: null,
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, openModal, closeModal, setGlobalLoading } = uiSlice.actions;
export const selectSidebarCollapsed = (state: { ui: UiSliceState }) => state.ui.sidebarCollapsed;
export const selectActiveModal = (state: { ui: UiSliceState }) => state.ui.activeModal;
export const selectGlobalLoading = (state: { ui: UiSliceState }) => state.ui.globalLoading;

export default uiSlice.reducer;
