import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { GridType } from "./grid"
import { Task } from "redux-saga"

// Define the Facility interface
export interface View {
  name: string
  headerTopData: Array<string>
  headerBottomData: Array<{
    field: string
    headerName: string
    date: number
    editable: boolean
    sortable: boolean
    width: number
    minWidth: number
  }>
  cells?: {
    [key: string]: {
      state: string
      source?: string
      tasks: {
        [key: string]: {
          taskId: string
          left?: number
          width?: number
          duration: number
        }
      }
    }
  }
  cellWidth: number
  isEditable?: boolean
}

// Define the state structure for facilities
interface ViewState {
  view: View | null
  loading: boolean
  error: string | null
}

// Initial state for the facilities slice
const initialState: ViewState = {
  view: null,
  loading: false,
  error: null,
}

function findClosestDateStart(
  dateTimestamps: Array<number>,
  dateTimestamp: number
) {
  const closest = dateTimestamps.reduce((acc, weekTimestamp) => {
    const num = weekTimestamp - dateTimestamp
    if (num <= 0 && Math.abs(num) < Math.abs(acc)) {
      return num
    }
    return acc
  }, Infinity)

  return closest + dateTimestamp
}

const getTaskLeftOffset = (
  targetTimestamp: number,
  dayTimestamp: number,
  cellWidth: number,
  diff: number
) => {
  //calculate amount of days from week timestamp to day timestamp
  const days = (dayTimestamp - targetTimestamp) / (1000 * 60 * 60 * 24)
  return (days * cellWidth) / diff
}

// Create the facilities slice
export const viewSlice = createSlice({
  name: "view",
  initialState,
  reducers: {
    setMonthView: (
      state,
      action: PayloadAction<{ view: View; grid: GridType }>
    ) => {
      state.view = action.payload.view
      state.view.cells = action.payload.grid.cells
      state.view.isEditable = true
    },

    setQuarterView: (
      state,
      action: PayloadAction<{ view: View; grid: GridType }>
    ) => {
      const view = action.payload.view
      const cells = action.payload.grid.cells
      const cellWidth = view.cellWidth
      const weeks = view.headerBottomData.map((data) => data.date)

      const res = Object.entries(cells).reduce((acc, [key, value]) => {
        if (!acc) {
          acc = {}
        }
        const [rowId, colId] = key.split("-")
        const newColId = findClosestDateStart(weeks, Number(colId))

        const newKey = `${rowId}-${newColId}`
        if (!acc[newKey]) {
          acc[newKey] = { ...value, state: "occupied-start" }
        } else {
          const newTasks = Object.values(value.tasks).reduce((acc, task) => {
            if (acc[task.taskId]) {
              return acc
            }

            const width = (cellWidth / 7) * task.duration
            const left = getTaskLeftOffset(
              newColId,
              Number(colId),
              cellWidth,
              7
            )

            return {
              ...acc,
              [task.taskId]: {
                ...task,
                left,
                width,
                duration: task.duration,
              },
            }
          }, {} as { [key: string]: { taskId: string; left?: number; width: number; duration: number } })
          acc[newKey].tasks = { ...acc[newKey].tasks, ...newTasks }
        }

        return acc
      }, view.cells)

      state.view = { ...view, cells: res, isEditable: false }
    },
    setYearView: (
      state,
      action: PayloadAction<{ view: View; grid: GridType }>
    ) => {
      const view = action.payload.view
      const cells = action.payload.grid.cells
      const cellWidth = view.cellWidth
      const months = view.headerBottomData.map((data) => data.date)
      const res = Object.entries(cells).reduce((acc, [key, value]) => {
        if (!acc) {
          acc = {}
        }
        const [rowId, colId] = key.split("-")
        const newColId = findClosestDateStart(months, Number(colId))
        const newKey = `${rowId}-${newColId}`
        if (!acc[newKey]) {
          acc[newKey] = { ...value, state: "occupied-start" }
        } else {
          const newTasks = Object.values(value.tasks).reduce((acc, task) => {
            if (acc[task.taskId]) {
              return acc
            }

            const width = (cellWidth / 30) * task.duration
            const left = getTaskLeftOffset(
              newColId,
              Number(colId),
              cellWidth,
              30
            )
            return {
              ...acc,
              [task.taskId]: {
                ...task,
                left,
                width,
                duration: task.duration,
              },
            }
          }, {} as { [key: string]: { taskId: string; left?: number; width: number; duration: number } })
          acc[newKey].tasks = { ...acc[newKey].tasks, ...newTasks }
        }

        return acc
      }, view.cells)
      state.view = { ...view, cells: res, isEditable: false }
    },
  },
})
// Export the actions
export const { setMonthView, setQuarterView, setYearView } = viewSlice.actions

// Export the reducer
export default viewSlice.reducer
