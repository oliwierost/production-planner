import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Task } from "./tasks"
import { facilityId } from "./facilities"

interface DragState {
  disabled: boolean
  overFacilityId: facilityId | null
  draggedTask?: Task | null
  delta: {
    x: number
    y: number
  }
}

const initialState: DragState = {
  disabled: false,
  overFacilityId: null,
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
    setOverFacilityId: (state, action: PayloadAction<facilityId | null>) => {
      state.overFacilityId = action.payload
    },
  },
})

// Export the actions
export const { setDragDisabled, setDraggedTask, setOverFacilityId, setDelta } =
  dragSlice.actions

// Export the reducer
export default dragSlice.reducer
