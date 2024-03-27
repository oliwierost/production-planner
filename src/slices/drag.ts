import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Task } from "./tasks"
import { facilityId } from "./facilities"

interface DragState {
  disabled: boolean
  overFacilityId: facilityId | null
  draggedTask?: Task | null
}

const initialState: DragState = {
  disabled: false,
  overFacilityId: null,
  draggedTask: null,
}

export const dragSlice = createSlice({
  name: "drag",
  initialState,
  reducers: {
    setDragDisabled: (state, action: PayloadAction<boolean>) => {
      state.disabled = action.payload
    },
    setDraggedTask: (state, action: PayloadAction<{ task: Task | null }>) => {
      const { task } = action.payload
      state.draggedTask = task
    },

    setOverFacilityId: (state, action: PayloadAction<facilityId | null>) => {
      state.overFacilityId = action.payload
    },
  },
})

// Export the actions
export const { setDragDisabled, setDraggedTask, setOverFacilityId } =
  dragSlice.actions

// Export the reducer
export default dragSlice.reducer
