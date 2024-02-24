import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { Grid, View } from "../../types"

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
  dateTimestamp: number,
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
  diff: number,
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
      action: PayloadAction<{ view: View; grid: Grid }>,
    ) => {
      state.view = action.payload.view
      state.view.cells = action.payload.grid.cells
      state.view.isEditable = true
    },

    setQuarterView: (
      state,
      action: PayloadAction<{ view: View; grid: Grid }>,
    ) => {
      const view = action.payload.view
      const cells = action.payload.grid.cells
      const cellWidth = view.cellWidth
      const weeks = view.headerBottomData.map((data) => data.date)
      const addedTasks: string[] = []
      const cellsArr = Object.entries(cells)
      const res = cellsArr.reduce((cellsAcc, [key, value]) => {
        if (!cellsAcc) {
          cellsAcc = {}
        }
        if (value.state !== "occupied-start") return cellsAcc
        const [rowId, colId] = key.split("-")
        const newColId = findClosestDateStart(weeks, Number(colId))
        const newKey = `${rowId}-${newColId}`
        const taskArr = Object.values(value.tasks)
        if (!cellsAcc[newKey]) {
          cellsAcc[newKey] = { ...value, state: "occupied-start" }
          const newTasks = taskArr.reduce(
            (acc, task) => {
              if (acc[task.taskId]) {
                return acc
              }
              const width = (cellWidth / 7) * task.duration
              const left = getTaskLeftOffset(
                newColId,
                Number(colId),
                cellWidth,
                7,
              )
              addedTasks.push(task.taskId)
              return {
                ...acc,
                [task.taskId]: {
                  ...task,
                  left,
                  width,
                  duration: task.duration,
                },
              }
            },
            {} as {
              [key: string]: {
                taskId: string
                left?: number
                width: number
                duration: number
              }
            },
          )
          cellsAcc[newKey].tasks = { ...newTasks }
        }

        return cellsAcc
      }, view.cells)

      state.view = { ...view, cells: res, isEditable: false }
    },
    setYearView: (state, action: PayloadAction<{ view: View; grid: Grid }>) => {
      const view = action.payload.view
      const cells = action.payload.grid.cells
      const cellWidth = view.cellWidth
      const weeks = view.headerBottomData.map((data) => data.date)
      const addedTasks: string[] = []
      const cellsArr = Object.entries(cells)
      const res = cellsArr.reduce((cellsAcc, [key, value]) => {
        if (!cellsAcc) {
          cellsAcc = {}
        }
        if (value.state !== "occupied-start") return cellsAcc
        const [rowId, colId] = key.split("-")
        const newColId = findClosestDateStart(weeks, Number(colId))
        const newKey = `${rowId}-${newColId}`
        const taskArr = Object.values(value.tasks)
        if (!cellsAcc[newKey]) {
          cellsAcc[newKey] = { ...value, state: "occupied-start" }
          const newTasks = taskArr.reduce(
            (acc, task) => {
              if (acc[task.taskId]) {
                return acc
              }
              const width = (cellWidth / 30) * task.duration
              const left = getTaskLeftOffset(
                newColId,
                Number(colId),
                cellWidth,
                30,
              )
              addedTasks.push(task.taskId)
              return {
                ...acc,
                [task.taskId]: {
                  ...task,
                  left,
                  width,
                  duration: task.duration,
                },
              }
            },
            {} as {
              [key: string]: {
                taskId: string
                left?: number
                width: number
                duration: number
              }
            },
          )
          cellsAcc[newKey].tasks = { ...newTasks }
        }

        return cellsAcc
      }, view.cells)

      state.view = { ...view, cells: res, isEditable: false }
    },
  },
})
// Export the actions
export const { setMonthView, setQuarterView, setYearView } = viewSlice.actions

// Export the reducer
export default viewSlice.reducer
