import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Task } from "./tasks"

interface DraggedTask {
  draggableId: string | null
  task: Task | null
}
interface DragState {
  disabled: boolean
  draggedTask?: DraggedTask | null
}

const initialState: DragState = {
  disabled: false,
  draggedTask: {
    draggableId: null,
    task: null,
  },
}

export const dragSlice = createSlice({
  name: "drag",
  initialState,
  reducers: {
    setDragDisabled: (state, action: PayloadAction<boolean>) => {
      state.disabled = action.payload
    },
    setDraggedTask: (state, action: PayloadAction<DraggedTask>) => {
      state.draggedTask = action.payload
    },
  },
})

// Export the actions
export const { setDragDisabled, setDraggedTask } = dragSlice.actions

// Export the reducer
export default dragSlice.reducer
