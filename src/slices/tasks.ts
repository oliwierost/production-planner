import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { projectId } from "./projects"
import { workspaceId } from "./workspaces"

// Define the Task interface
export type taskId = string
export interface Task {
  id: string
  title: string
  description: string
  bgcolor: string // Background color
  duration: number
  dropped: boolean // Indicates if the task has been placed on the grid
  facilityId: string | null
  startTime: number | null
  projectId: projectId
  workspaceId: workspaceId
  requiredTasks: taskId[]
  requiredByTasks: taskId[]
  locked: boolean
}

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

    undropMultipleTasks: (
      state,
      action: PayloadAction<{ tasks: { [id: taskId]: Task } }>,
    ) => {
      const { tasks } = action.payload
      Object.values(tasks).forEach((task) => {
        state.tasks[task.projectId][task.id] = {
          ...task,
          dropped: false,
          startTime: null,
          facilityId: null,
        }
      })
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
    updateRequiredTasks: (
      state,
      action: PayloadAction<{
        taskId: taskId
        requiredTasks: taskId[]
        projectId: projectId
      }>,
    ) => {
      const { taskId, requiredTasks, projectId } = action.payload
      if (projectId && taskId) {
        requiredTasks.forEach((requiredTaskId) => {
          const requiredByTasks =
            state.tasks[projectId][requiredTaskId]?.requiredByTasks
          if (!requiredByTasks.includes(taskId)) {
            state.tasks[projectId][taskId].requiredByTasks.push(taskId)
          }
        })
      }
    },
    updateRequiredByTasks: (
      state,
      action: PayloadAction<{
        taskId: taskId
        requiredByTasks: taskId[]
        projectId: projectId
      }>,
    ) => {
      const { taskId, requiredByTasks, projectId } = action.payload
      if (projectId && taskId) {
        requiredByTasks.forEach((requiredByTaskId) => {
          const requiredTasks =
            state.tasks[projectId][requiredByTaskId]?.requiredTasks
          if (requiredTasks && requiredTasks.includes(taskId)) {
            const index = requiredTasks.indexOf(taskId)
            if (index !== -1) {
              requiredTasks.splice(index, 1)
            }
          }
        })
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
    setTaskLockedStart(
      state,
      action: PayloadAction<{
        task: Task
        locked: boolean
      }>,
    ) {
      state.loading = true
      state.error = null
      console.info("setTaskLockedStart", action.payload)
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
  undropMultipleTasks,
  setTaskLockedStart,
  deleteTaskStart,
  updateRequiredByTasks,
  updateRequiredTasks,
  updateTaskStart,
  setTaskDroppedStart,
  resizeTaskStart,
  syncTasksStart,
} = tasksSlice.actions

// Export the reducer
export default tasksSlice.reducer
