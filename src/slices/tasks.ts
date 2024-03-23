import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { projectId } from "./projects"
import { workspaceId } from "./workspaces"

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
  projectId: projectId
  workspaceId: workspaceId
}

export type taskId = string

// Define the state structure for tasks
interface TasksState {
  tasks: {
    [id: projectId]: {
      [id: taskId]: Task
    }
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
      if (!state.tasks[task.projectId]) {
        state.tasks[task.projectId] = {}
      }
      state.tasks[task.projectId][task.id] = task
    },
    // Action to remove a task by its ID
    removeTask: (state, action: PayloadAction<Task>) => {
      const task = action.payload
      delete state.tasks[task.projectId][task.id]
    },
    updateTask: (state, action: PayloadAction<{ task: Task; data: any }>) => {
      const { task, data } = action.payload
      if (task) {
        state.tasks[task.projectId][task.id] = { ...task, ...data }
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
        console.log("adsa", task, dragged)
        state.tasks[task.projectId][task.id].dragged = dragged
      }
    },
    // You can add more actions here as needed, for example, to mark a task as dropped
    setTaskDropped: (
      state,
      action: PayloadAction<{ task: Task; dropped: boolean }>,
    ) => {
      const { task, dropped } = action.payload
      if (task) {
        state.tasks[task.projectId][task.id].dropped = dropped
      }
    },
    setTasks(
      state,
      action: PayloadAction<{ [id: projectId]: { [id: taskId]: Task } }>,
    ) {
      const tasks = action.payload
      state.tasks = { ...tasks, ...state.tasks }
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
    addTaskStart(
      state,
      action: PayloadAction<{ task: Task; workspaceId: string }>,
    ) {
      state.loading = true
      state.error = null
      console.info("addTaskStart", action.payload)
    },
    updateTaskStart(
      state,
      action: PayloadAction<{
        task: Task
        data: any
        workspaceId: workspaceId
      }>,
    ) {
      state.loading = true
      state.error = null
      console.info("updateTaskStart", action.payload)
    },
    resizeTaskStart(
      state,
      action: PayloadAction<{
        task: Task
        cellId: string
        newDuration: number
      }>,
    ) {
      state.loading = true
      state.error = null
      console.info("resizeTaskStart", action.payload)
    },
    setTaskDraggedStart(
      state,
      action: PayloadAction<{
        task: Task
        dragged: boolean
        cellId?: string
      }>,
    ) {
      state.loading = true
      state.error = null
      console.info("setTaskDraggedStart", action.payload)
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
      console.info("moveTaskStart", action.payload)
    },
    deleteTaskStart(
      state,
      action: PayloadAction<{
        task: Task
        facilityId?: string
        colId?: number
        cellSpan?: number
      }>,
    ) {
      state.loading = true
      state.error = null
      console.info("deleteTaskStart", action.payload)
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
      console.info("setTaskDroppedStart", action.payload)
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
  resizeTaskStart,
  syncTasksStart,
  setTaskDragged,
  setTaskDraggedStart,
} = tasksSlice.actions

// Export the reducer
export default tasksSlice.reducer
