import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// Define the Task interface
export interface Deadline {
  id: string
  title: string
  description: string
  timestamp: {
    day: number
    week: number
    month: number
  }
}

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
    },
    removeDeadline: (state, action: PayloadAction<string>) => {
      delete state.deadlines[action.payload]
    },
    updateDeadline: (state, action: PayloadAction<Deadline>) => {
      const deadline = action.payload
      state.deadlines[deadline.id] = deadline
    },
    setDeadlines: (
      state,
      action: PayloadAction<{ [id: string]: Deadline }>,
    ) => {
      state.deadlines = action.payload
      state.loading = false
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
    },
    removeDeadlineStart: (state, action: PayloadAction<string>) => {
      state.loading = true
      state.error = null
    },
    updateDeadlineStart: (
      state,
      action: PayloadAction<{ id: string; data: any }>,
    ) => {
      state.loading = true
      state.error = null
    },
    setDeadlinesStart: (state, action: PayloadAction<Deadline[]>) => {
      state.loading = true
      state.error = null
    },
    syncDeadlinesStart: (state) => {
      state.loading = true
      state.error = null
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
