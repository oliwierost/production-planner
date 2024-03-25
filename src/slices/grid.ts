import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { Task } from "./tasks"
import { projectId } from "./projects"
import { workspaceId } from "./workspaces"
import { Facility, facilityId } from "./facilities"
import { calculateTaskDurationHelper } from "../components/DataGrid/calculateTaskDurationHelper"

export interface Cell {
  state: string
  tasks: {
    [key: string]: {
      task: Task
      left?: number
      width?: number
    }
  }
  source: string
}

// TODO move to types, clean up types
export interface GridType {
  cells: {
    [key: string]: Cell | null
  }
}

interface GridState {
  grid: {
    [key: workspaceId]: GridType
  }
  loading: boolean
  error: string | null
}

const initialState: GridState = {
  grid: {},
  loading: false,
  error: null,
}

const gridSlice = createSlice({
  name: "grid",
  initialState,
  reducers: {
    // Action to initialize the grid with a predefined size
    initializeGrid: (
      state,
      action: PayloadAction<{
        workspaceId: workspaceId
      }>,
    ) => {
      const { workspaceId } = action.payload
      if (!state.grid[workspaceId]) {
        state.grid[workspaceId] = {
          cells: {},
        }
      }
    },
    setCell: (
      state,
      action: PayloadAction<{
        cellId: string
        cell: Cell
        workspaceId: workspaceId
      }>,
    ) => {
      const { cellId, cell, workspaceId } = action.payload
      if (!state.grid[workspaceId]) {
        state.grid[workspaceId] = {
          cells: {},
        }
      }
      if (state.grid[workspaceId]) {
        state.grid[workspaceId]!.cells[cellId] = cell
      }
    },
    setCellsOccupied: (
      state,
      action: PayloadAction<{
        facility: Facility
        colId: string
        task: Task
        workspaceId: workspaceId
      }>,
    ) => {
      const { facility, colId, task, workspaceId } = action.payload
      const { id: rowId, manpower } = facility
      const { id: taskId, duration } = task
      const colTime = Number(colId)
      const originalDate = new Date(colTime)
      const actualDuration = calculateTaskDurationHelper({ manpower, duration })

      const cellId = `${rowId}-${colTime}`
      if (!state.grid[workspaceId]) {
        state.grid[workspaceId] = {
          cells: {},
        }
      }
      state.grid[workspaceId].cells[cellId] = {
        state: "occupied-start",
        tasks: {
          [taskId]: {
            task: {
              ...task,
              startTime: colTime,
              facilityId: rowId,
              dragged: false,
            },
          },
        },
        source: cellId,
      }
      if (actualDuration > 1) {
        for (let i = 1; i < actualDuration - 1; i++) {
          const nextDate = new Date(originalDate)
          nextDate.setDate(originalDate.getDate() + i)
          const nextDateTime = nextDate.getTime()
          state.grid[workspaceId].cells[`${rowId}-${nextDateTime}`] = {
            state: "occupied",
            tasks: {
              [taskId]: {
                task: {
                  ...task,
                  startTime: colTime,
                  facilityId: rowId,
                  dragged: false,
                },
              },
            },
            source: cellId,
          }
        }
        const lastDate = new Date(originalDate)
        lastDate.setDate(originalDate.getDate() + (actualDuration - 1))
        const lastDateTime = lastDate.getTime()
        state.grid[workspaceId].cells[`${rowId}-${lastDateTime}`] = {
          state: "occupied-end",
          tasks: {
            [taskId]: {
              task: {
                ...task,
                startTime: colTime,
                facilityId: rowId,
                dragged: false,
              },
            },
          },
          source: cellId,
        }
      }
    },

    removeCell: (
      state,
      action: PayloadAction<{ cellId: string; workspaceId: workspaceId }>,
    ) => {
      const { cellId, workspaceId } = action.payload
      if (!state.grid) {
        return
      }
      delete state.grid[workspaceId].cells[cellId]
    },
    removeFacilityFromGrid: (
      state,
      action: PayloadAction<{
        facilityId: facilityId
        workspaceId: workspaceId
      }>,
    ) => {
      if (!state.grid) {
        return
      }
      const { facilityId, workspaceId } = action.payload
      const cells = state.grid[workspaceId].cells
      Object.keys(cells).forEach((cellId) => {
        if (cellId.includes(facilityId)) {
          delete state.grid[workspaceId].cells[cellId]
        }
      })
    },
    updateTaskInCell: (
      state,
      action: PayloadAction<{
        cellId: string
        task: Task
        data: any
        workspaceId: workspaceId
      }>,
    ) => {
      const { cellId, task, data, workspaceId } = action.payload
      console.log(data)
      const cell = state.grid[workspaceId].cells[cellId]
      if (cell) {
        state.grid[workspaceId].cells[cellId]!.tasks[task.id] = {
          ...cell.tasks[task.id],
          task: {
            ...task,
            ...data,
            dragged: false,
          },
        }
      }
    },

    removeCells: (
      state,
      action: PayloadAction<{
        facility: Facility
        colId: string
        duration: number
        workspaceId: workspaceId
      }>,
    ) => {
      const { facility, colId, duration, workspaceId } = action.payload
      const { id: rowId, manpower } = facility
      if (!state.grid) {
        return
      }
      const colTime = Number(colId)
      const originalDate = new Date(colTime)
      const actualDuration = calculateTaskDurationHelper({ manpower, duration })
      for (let i = 0; i <= actualDuration - 1; i++) {
        const nextDate = new Date(originalDate)
        nextDate.setDate(originalDate.getDate() + i)
        const nextDateTime = nextDate.getTime()
        delete state.grid[workspaceId].cells[`${rowId}-${nextDateTime}`]
      }
    },
    // Triggered when the grid fetch starts
    fetchGridStart(state) {
      state.loading = true
      state.error = null
    },
    // Triggered when the grid data is successfully fetched or updated
    setGrid(
      state,
      action: PayloadAction<{ grid: { [id: workspaceId]: GridType } }>,
    ) {
      const { grid } = action.payload
      state.grid = { ...grid, ...state.grid }
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
  updateTaskInCell,
} = gridSlice.actions

// Default export the reducer
export default gridSlice.reducer
