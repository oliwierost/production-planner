import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Task } from "./tasks"

interface DragState {
  disabled: boolean
  draggedTask?: Task | null
  delta: {
    x: number
    y: number
  }
}

const initialState: DragState = {
  disabled: false,
  delta: {
    x: 0,
    y: 0,
  },
  draggedTask: null,
}

export const dragSlice = createSlice({
  name: "drag",
  initialState,
  reducers: {
    setDragDisabled: (state, action: PayloadAction<boolean>) => {
      state.disabled = action.payload
    },
    setDraggedTask: (state, action: PayloadAction<Task | null>) => {
      state.draggedTask = action.payload
    },
    setDelta: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.delta = action.payload
    },
  },
})

// Export the actions
export const { setDragDisabled, setDraggedTask, setDelta } = dragSlice.actions

// Export the reducer
export default dragSlice.reducer
