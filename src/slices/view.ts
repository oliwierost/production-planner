import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import _ from "lodash"

// Define the Facility interface

export interface TimeMapping {
  [timestamp: number]: number[]
}

export interface View {
  name: string
  headerTopData: Array<string>
  headerBottomData: Array<{
    field: string
    headerName: string
    date: number
    editable: boolean
    sortable: boolean
    width: number
    minWidth: number
  }>
  cellWidth: number
  isEditable?: boolean
  daysInCell: number
}

// Define the state structure for facilities
interface ViewState {
  view: View | null
  weekMapping: TimeMapping
  monthMapping: TimeMapping
  loading: boolean
  error: string | null
}

// Initial state for the facilities slice
const initialState: ViewState = {
  view: null,
  weekMapping: {},
  monthMapping: {},
  loading: false,
  error: null,
}

// Create the facilities slice
export const viewSlice = createSlice({
  name: "view",
  initialState,
  reducers: {
    initializeMappings: (
      state,
      action: PayloadAction<{
        weekMapping: TimeMapping
        monthMapping: TimeMapping
      }>,
    ) => {
      state.weekMapping = action.payload.weekMapping
      state.monthMapping = action.payload.monthMapping
    },
    setMonthView: (state, action: PayloadAction<{ view: View }>) => {
      state.view = action.payload.view
      state.view.isEditable = true
    },

    setQuarterView: (state, action: PayloadAction<{ view: View }>) => {
      const view = action.payload.view
      state.view = { ...view, isEditable: false }
    },
    setYearView: (state, action: PayloadAction<{ view: View }>) => {
      const view = action.payload.view
      state.view = { ...view, isEditable: false }
    },
  },
})
// Export the actions
export const { initializeMappings, setMonthView, setQuarterView, setYearView } =
  viewSlice.actions

// Export the reducer
export default viewSlice.reducer
