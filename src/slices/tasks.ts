import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { select } from "redux-saga/effects"

// Define the Task interface
export interface Task {
  id: string
  title: string
  description: string
  bgcolor: string // Background color
  duration: number
  dropped: boolean // Indicates if the task has been placed on the grid
  facilityId: string | null
  startTime: number | null
  dragged?: boolean
}

// Define the state structure for tasks
interface TasksState {
  tasks: {
    [id: string]: Task
  }
  loading: boolean
  error: string | null
}

// Helper function to check time slot availability (pseudo-code)
export const isTimeSlotAvailable = (
  task: Task,
  tasks: { [id: string]: Task },
): boolean => {
  task && tasks
  // Implement logic to check if the time slot for the task is available.
  // This could involve checking the start time, duration, and facilityId
  // against other tasks to ensure there is no overlap.
  return true // Placeholder return value
}

// Initial state for the tasks slice
const initialState: TasksState = {
  tasks: {},
  loading: false,
  error: null,
}

// Create the tasks slice
export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // update task
    upsertTask: (state, action: PayloadAction<Task>) => {
      const task = action.payload
      if (isTimeSlotAvailable(task, state.tasks)) {
        state.tasks[task.id] = task
      } else {
        // handle conflict
      }
      state.tasks[task.id] = task
    },
    // Action to remove a task by its ID
    removeTask: (state, action: PayloadAction<string>) => {
      delete state.tasks[action.payload]
    },
    updateTask: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const { id, data } = action.payload
      const task = state.tasks[id]
      if (task) {
        state.tasks[id] = { ...task, ...data }
      }
    },
    moveTask: (
      state,
      action: PayloadAction<{
        id: string
        facilityId: string
        startTime: number
      }>,
    ) => {
      const { id, facilityId, startTime } = action.payload
      const task = state.tasks[id]
      if (task) {
        const updatedTask = { ...task, facilityId, startTime }
        if (isTimeSlotAvailable(updatedTask, state.tasks)) {
          state.tasks[id] = updatedTask
        } else {
          // handle conflict
        }
      }
    },
    setTaskDragged: (
      state,
      action: PayloadAction<{
        task: Task
        dragged: boolean
      }>,
    ) => {
      const { task, dragged } = action.payload
      if (task) {
        state.tasks[task.id].dragged = dragged
      }
    },
    // You can add more actions here as needed, for example, to mark a task as dropped
    setTaskDropped: (
      state,
      action: PayloadAction<{ id: string; dropped: boolean }>,
    ) => {
      const { id, dropped } = action.payload
      const task = state.tasks[id]
      if (task) {
        task.dropped = dropped
      }
    },
    setTasks(state, action: PayloadAction<{ [id: string]: Task }>) {
      state.tasks = action.payload
      state.loading = false
    },
    fetchTasksStart(state) {
      state.loading = true
      state.error = null
    },
    // Triggered when fetching or updating the grid fails
    taskOperationFailed(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    // Triggered to start the grid update process
    updateTasksStart(state /*action: PayloadAction<GridType>*/) {
      state.loading = true
      state.error = null
    },
    addTaskStart(state, action: PayloadAction<Task>) {
      state.loading = true
      state.error = null
    },
    updateTaskStart(state, action: PayloadAction<{ id: string; data: any }>) {
      state.loading = true
      state.error = null
    },
    setTaskDraggedStart(
      state,
      action: PayloadAction<{
        task: Task
        dragged: boolean
        cellId: string
      }>,
    ) {
      state.loading = true
      state.error = null
    },
    moveTaskStart(
      state,
      action: PayloadAction<{
        sourceRowId: string
        sourceColId: number
        rowId: string
        colId: string
        task: Task
      }>,
    ) {
      state.loading = true
      state.error = null
    },
    deleteTaskStart(
      state,
      action: PayloadAction<{
        taskId: string
        facilityId?: string
        colId?: number
        cellSpan?: number
      }>,
    ) {
      state.loading = true
      state.error = null
    },
    setTaskDroppedStart(
      state,
      action: PayloadAction<{
        dropped: boolean
        rowId: string
        colId: number
        task: Task
      }>,
    ) {
      state.loading = true
      state.error = null
    },
    syncTasksStart(state /*action: PayloadAction<GridType>*/) {
      state.loading = true
      state.error = null
    },
  },
})

// Export the actions
export const {
  upsertTask,
  removeTask,
  moveTask,
  setTaskDropped,
  fetchTasksStart,
  updateTask,
  setTasks,
  taskOperationFailed,
  updateTasksStart,
  addTaskStart,
  moveTaskStart,
  deleteTaskStart,
  updateTaskStart,
  setTaskDroppedStart,
  syncTasksStart,
  setTaskDragged,
  setTaskDraggedStart,
} = tasksSlice.actions

// Export the reducer
export default tasksSlice.reducer
