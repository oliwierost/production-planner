import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Cell {
  state: string;
  taskID: string;
  source: string;
}

// TODO move to types, clean up types
export interface GridType {
  cells: {
    [key: string]: Cell;
  };
  columnCount?: number;
  rowCount?: number;
}

interface GridState {
  grid: GridType | null;
  loading: boolean;
  error: string | null;
}

const initialState: GridState = {
  grid: null,
  loading: false,
  error: null,
};

const gridSlice = createSlice({
  name: "grid",
  initialState,
  reducers: {
    // Action to initialize the grid with a predefined size
    initializeGrid: (
      state,
      action: PayloadAction<{ rowCount: number; columnCount: number }>
    ) => {
      if (!state.grid) {
        state.grid = {
          cells: {},
        };
      }
      state.grid.rowCount = action.payload.rowCount;
      state.grid.columnCount = action.payload.columnCount;
    },
    setCell: (state, action: PayloadAction<{ cellId: string; cell: Cell }>) => {
      const { cellId, cell } = action.payload;
      if (!state.grid) {
        state.grid = {
          cells: {},
        };
      }
      state.grid.cells[cellId] = cell;
    },
    removeCell: (state, action: PayloadAction<{ cellId: string }>) => {
      if (!state.grid) {
        return;
      }
      delete state.grid.cells[action.payload.cellId];
    },
    // Triggered when the grid fetch starts
    fetchGridStart(state) {
      state.loading = true;
      state.error = null;
    },
    // Triggered when the grid data is successfully fetched or updated
    setGrid(state, action: PayloadAction<GridType>) {
      state.grid = action.payload;
      state.loading = false;
    },
    // Triggered when fetching or updating the grid fails
    gridOperationFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // Triggered to start the grid update process
    updateGridStart(state /*action: PayloadAction<GridType>*/) {
      state.loading = true;
      state.error = null;
    },
  },
});

export const {
  fetchGridStart,
  setGrid,
  gridOperationFailed,
  updateGridStart,
  initializeGrid,
  removeCell,
  setCell,
} = gridSlice.actions;

// Default export the reducer
export default gridSlice.reducer;
