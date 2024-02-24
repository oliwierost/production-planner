import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface DragState {
  disabled: boolean
  over: boolean
  draggedTaskId?: string | null
}

const initialState: DragState = {
  disabled: false,
  over: false,
  draggedTaskId: null,
}

export const dragSlice = createSlice({
  name: "drag",
  initialState,
  reducers: {
    setDragDisabled: (state, action: PayloadAction<boolean>) => {
      state.disabled = action.payload
    },
    setDragOver: (state, action: PayloadAction<boolean>) => {
      state.over = action.payload
    },
    setDraggedTask: (state, action: PayloadAction<string | null>) => {
      state.draggedTaskId = action.payload
    },
  },
})

// Export the actions
export const { setDragDisabled, setDragOver, setDraggedTask } =
  dragSlice.actions

// Export the reducer
export default dragSlice.reducer
