import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export interface Cell {
  state: string
  tasks: {
    [key: string]: {
      taskId: string
      left?: number
      width?: number
      duration: number
    }
  }
  source: string
}

// TODO move to types, clean up types
export interface GridType {
  cells: {
    [key: string]: Cell
  }
}

interface GridState {
  grid: GridType | null
  loading: boolean
  error: string | null
}

const initialState: GridState = {
  grid: null,
  loading: false,
  error: null,
}

const gridSlice = createSlice({
  name: "grid",
  initialState,
  reducers: {
    // Action to initialize the grid with a predefined size
    initializeGrid: (state) => {
      if (!state.grid) {
        state.grid = {
          cells: {},
        }
      }
    },
    setCell: (state, action: PayloadAction<{ cellId: string; cell: Cell }>) => {
      const { cellId, cell } = action.payload
      if (!state.grid) {
        state.grid = {
          cells: {},
        }
      }
      state.grid.cells[cellId] = cell
    },
    setCellsOccupied: (
      state,
      action: PayloadAction<{
        rowId: string
        colId: string
        taskId: string
        cellSpan: number
      }>,
    ) => {
      const { rowId, colId, taskId, cellSpan } = action.payload
      const colTime = Number(colId)
      const originalDate = new Date(colTime)
      const duration = cellSpan

      const cellId = `${rowId}-${colTime}`
      if (!state.grid) {
        state.grid = {
          cells: {},
        }
      }
      state.grid.cells[cellId] = {
        state: "occupied-start",
        tasks: { [taskId]: { taskId, duration } },
        source: cellId,
      }
      if (duration > 1) {
        for (let i = 1; i < duration - 1; i++) {
          const nextDate = new Date(originalDate)
          nextDate.setDate(originalDate.getDate() + i)
          const nextDateTime = nextDate.getTime()
          state.grid.cells[`${rowId}-${nextDateTime}`] = {
            state: "occupied",
            tasks: { [taskId]: { taskId, duration } },
            source: cellId,
          }
        }
        const lastDate = new Date(originalDate)
        lastDate.setDate(originalDate.getDate() + (duration - 1))
        const lastDateTime = lastDate.getTime()
        state.grid.cells[`${rowId}-${lastDateTime}`] = {
          state: "occupied-end",
          tasks: { [taskId]: { taskId, duration } },
          source: cellId,
        }
      }
    },

    removeCell: (state, action: PayloadAction<{ cellId: string }>) => {
      if (!state.grid) {
        return
      }
      delete state.grid.cells[action.payload.cellId]
    },
    removeFacilityFromGrid: (
      state,
      action: PayloadAction<{ facilityId: string }>,
    ) => {
      if (!state.grid) {
        return
      }
      const { facilityId } = action.payload
      Object.keys(state.grid.cells).forEach((cellId) => {
        if (cellId.includes(facilityId)) {
          delete state.grid?.cells[cellId]
        }
      })
    },
    removeCells: (
      state,
      action: PayloadAction<{ rowId: string; colId: string; cellSpan: number }>,
    ) => {
      const { rowId, colId, cellSpan } = action.payload
      if (!state.grid) {
        return
      }
      const colTime = Number(colId)
      const originalDate = new Date(colTime)
      for (let i = 0; i <= cellSpan - 1; i++) {
        const nextDate = new Date(originalDate)
        nextDate.setDate(originalDate.getDate() + i)
        const nextDateTime = nextDate.getTime()
        delete state.grid.cells[`${rowId}-${nextDateTime}`]
      }
    },
    // Triggered when the grid fetch starts
    fetchGridStart(state) {
      state.loading = true
      state.error = null
    },
    // Triggered when the grid data is successfully fetched or updated
    setGrid(state, action: PayloadAction<GridType>) {
      state.grid = action.payload
      state.loading = false
    },
    // Triggered when fetching or updating the grid fails
    gridOperationFailed(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    // Triggered to start the grid update process
    updateGridStart(state, action: PayloadAction<GridType>) {
      state.loading = true
      state.error = null
    },
    initializeGridStart(state) {
      state.loading = true
      state.error = null
    },
    syncGridStart(state) {
      state.loading = true
      state.error = null
    },
  },
})

export const {
  fetchGridStart,
  setGrid,
  gridOperationFailed,
  updateGridStart,
  initializeGrid,
  removeCell,
  removeCells,
  setCell,
  setCellsOccupied,
  initializeGridStart,
  removeFacilityFromGrid,
  syncGridStart,
} = gridSlice.actions

// Default export the reducer
export default gridSlice.reducer
