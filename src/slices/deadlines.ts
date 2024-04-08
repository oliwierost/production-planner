import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { projectId } from "./projects"

export type deadlineId = string
// Define the Task interface
export interface Deadline {
  id: string
  title: string
  description: string
  projectId: string
  workspaceId: string
  timestamp: {
    day: number
    week: number
    month: number
  }
}

// Define the state structure for tasks
interface DeadlinesState {
  deadlines: {
    [id: projectId]: {
      [id: deadlineId]: Deadline
    }
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
      if (!state.deadlines[deadline.projectId]) {
        state.deadlines[deadline.projectId] = {}
      }
      state.deadlines[deadline.projectId][deadline.id] = deadline
    },
    removeDeadline: (state, action: PayloadAction<Deadline>) => {
      const deadline = action.payload
      delete state.deadlines[deadline.projectId][deadline.id]
    },
    updateDeadline: (state, action: PayloadAction<Deadline>) => {
      const deadline = action.payload
      state.deadlines[deadline.projectId][deadline.id] = {
        ...state.deadlines[deadline.projectId][deadline.id],
        ...deadline,
      }
    },
    setDeadlines: (
      state,
      action: PayloadAction<{
        [id: projectId]: { [id: deadlineId]: Deadline }
      }>,
    ) => {
      const deadlines = action.payload
      state.deadlines = { ...deadlines, ...state.deadlines }
      state.loading = false
    },
    addDeadlineStart: (
      state,
      action: PayloadAction<{
        id: string
        projectId: projectId
        workspaceId: string
        title: string
        description: string
        timestamp: {
          day: number
          week: number
          month: number
        }
      }>,
    ) => {
      console.info("addDeadlineStart", action.payload)
      state.loading = true
      state.error = null
    },
    removeDeadlineStart: (state, action: PayloadAction<Deadline>) => {
      console.info("removeDeadlineStart", action.payload)
      state.loading = true
      state.error = null
    },
    updateDeadlineStart: (
      state,
      action: PayloadAction<{
        data: any
        deadlineId: deadlineId
        projectId: projectId
        workspaceId: string
      }>,
    ) => {
      console.info("updateDeadlineStart", action.payload)
      state.loading = true
      state.error = null
    },
    setDeadlinesStart: (state, action: PayloadAction<Deadline[]>) => {
      console.info("setDeadlinesStart", action.payload)
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
