import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the Task interface
export interface Task {
  id: number;
  title: string;
  description: string;
  bgcolor: string; // Background color
  duration: number;
  dropped: boolean; // Indicates if the task has been placed on the grid
  facilityId?: number;
  startTime?: number;
}

// Define the state structure for tasks
interface TasksState {
  tasks: {
    [id: number]: Task;
  };
}

// Helper function to check time slot availability (pseudo-code)
export const isTimeSlotAvailable = (
  task: Task,
  tasks: { [id: number]: Task }
): boolean => {
  task && tasks;
  // Implement logic to check if the time slot for the task is available.
  // This could involve checking the start time, duration, and facilityId
  // against other tasks to ensure there is no overlap.
  return true; // Placeholder return value
};

// Initial state for the tasks slice
const initialState: TasksState = {
  tasks: {},
};

// Create the tasks slice
export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Action to add or update a task
    upsertTask: (state, action: PayloadAction<Task>) => {
      const task = action.payload;
      if (isTimeSlotAvailable(task, state.tasks)) {
        state.tasks[task.id] = task;
      } else {
        // handle conflict
      }
      state.tasks[task.id] = task;
    },
    // Action to remove a task by its ID
    removeTask: (state, action: PayloadAction<number>) => {
      delete state.tasks[action.payload];
    },
    moveTask: (
      state,
      action: PayloadAction<{
        id: number;
        facilityId: number;
        startTime: number;
      }>
    ) => {
      const { id, facilityId, startTime } = action.payload;
      const task = state.tasks[id];
      if (task) {
        const updatedTask = { ...task, facilityId, startTime };
        if (isTimeSlotAvailable(updatedTask, state.tasks)) {
          state.tasks[id] = updatedTask;
        } else {
          // handle conflict
        }
      }
    },
    // You can add more actions here as needed, for example, to mark a task as dropped
    setTaskDropped: (
      state,
      action: PayloadAction<{ id: number; dropped: boolean }>
    ) => {
      const { id, dropped } = action.payload;
      const task = state.tasks[id];
      if (task) {
        task.dropped = dropped;
      }
    },
  },
});

// Export the actions
export const { upsertTask, removeTask, moveTask, setTaskDropped } =
  tasksSlice.actions;

// Export the reducer
export default tasksSlice.reducer;
