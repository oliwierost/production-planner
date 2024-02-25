import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface Rect {
  left: number
  top: number
  width: number
  height: number
}
interface DragState {
  disabled: boolean
  over: boolean
  draggedTaskId?: string | null
  rect: Rect | null
}

const initialState: DragState = {
  disabled: false,
  over: false,
  draggedTaskId: null,
  rect: null,
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
    setRect: (state, action: PayloadAction<Rect | null>) => {
      state.rect = action.payload
    },
  },
})

// Export the actions
export const { setDragDisabled, setDragOver, setDraggedTask, setRect } =
  dragSlice.actions

// Export the reducer
export default dragSlice.reducer
