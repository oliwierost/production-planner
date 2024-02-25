import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { Deadline } from "../../types"

// Define the state structure for tasks
interface DeadlinesState {
  deadlines: {
    [id: string]: Deadline
  }
  loading: boolean
  error: string | null
}

// Initial state for the tasks slice
const initialState: DeadlinesState = {
  deadlines: {},
  loading: false,
  error: null,
}

// Create the tasks slice
export const deadlinesSlice = createSlice({
  name: "deadlines",
  initialState,
  reducers: {
    addDeadline: (state, action: PayloadAction<Deadline>) => {
      const deadline = action.payload
      state.deadlines[deadline.id] = deadline
      console.log("addDeadline", action.payload)
    },
    removeDeadline: (state, action: PayloadAction<string>) => {
      delete state.deadlines[action.payload]
      console.log("removeDeadline", action.payload)
    },
    updateDeadline: (state, action: PayloadAction<Deadline>) => {
      const deadline = action.payload
      state.deadlines[deadline.id] = deadline
      console.log("updateDeadline", action.payload)
    },
    setDeadlines: (
      state,
      action: PayloadAction<{ [id: string]: Deadline }>,
    ) => {
      state.deadlines = action.payload
      state.loading = false
      console.log("setDeadlines", action.payload)
    },
    addDeadlineStart: (
      state,
      action: PayloadAction<{
        id: string
        title: string
        description: string
        timestamp: {
          day: number
          week: number
          month: number
        }
      }>,
    ) => {
      state.loading = true
      state.error = null
      console.log("addDeadlineStart", action.payload)
    },
    removeDeadlineStart: (state, action: PayloadAction<string>) => {
      state.loading = true
      state.error = null
      console.log("removeDeadlineStart", action.payload)
    },
    updateDeadlineStart: (
      state,
      action: PayloadAction<{
        id: number
        title: string
        description: string
        timestamp: {
          day: number
          week: number
          month: number
        }
      }>,
    ) => {
      state.loading = true
      state.error = null
      console.log("updateDeadlineStart", action.payload)
    },
    setDeadlinesStart: (state, action: PayloadAction<Deadline[]>) => {
      state.loading = true
      state.error = null
      console.log("setDeadlinesStart", action.payload)
    },
    syncDeadlinesStart: (state) => {
      state.loading = true
      state.error = null
      console.log("syncDeadlinesStart")
    },
  },
})

// Export the actions
export const {
  addDeadline,
  removeDeadline,
  updateDeadline,
  setDeadlines,
  addDeadlineStart,
  removeDeadlineStart,
  updateDeadlineStart,
  setDeadlinesStart,
  syncDeadlinesStart,
} = deadlinesSlice.actions

// Export the reducer
export default deadlinesSlice.reducer
