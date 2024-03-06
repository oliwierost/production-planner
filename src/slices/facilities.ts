import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// Define the Facility interface
export interface Facility {
  id: string
  index?: number
  title: string
  location: string
  activity: string
  description: string
  bgcolor: string
  tasks: string[] // Array of task IDs
  manpower: number
}

// Define the state structure for facilities
interface FacilitiesState {
  facilities: {
    [id: string]: Facility
  }
  loading: boolean
  error: string | null
}

// Initial state for the facilities slice
const initialState: FacilitiesState = {
  facilities: {},
  loading: false,
  error: null,
}

// Create the facilities slice
export const facilitiesSlice = createSlice({
  name: "facilities",
  initialState,
  reducers: {
    // Action to add or update a facility
    upsertFacility: (state, action: PayloadAction<Facility>) => {
      const facility = action.payload
      // Initialize tasks array if not provided
      if (!facility.tasks) facility.tasks = []
      state.facilities[facility.id] = facility
    },
    // Action to remove a facility by its ID
    removeFacility: (state, action: PayloadAction<string>) => {
      delete state.facilities[action.payload]
    },
    // Action to assign a task to a facility
    assignTaskToFacility: (
      state,
      action: PayloadAction<{ facilityId: string; taskId: string }>,
    ) => {
      const { facilityId, taskId } = action.payload
      const facility = state.facilities[facilityId]
      if (facility && !facility.tasks.includes(taskId)) {
        facility.tasks.push(taskId)
      }
    },
    // Action to remove a task from a facility
    removeTaskFromFacility: (
      state,
      action: PayloadAction<{ facilityId: string; taskId: string }>,
    ) => {
      const { facilityId, taskId } = action.payload
      const facility = state.facilities[facilityId]
      if (facility) {
        facility.tasks = facility.tasks.filter((id) => id !== taskId)
      }
    },
    setFacilities(state, action: PayloadAction<{ [id: string]: Facility }>) {
      //add index property to each facility by bgcolor order
      const facilities = action.payload
      state.facilities = facilities
      state.loading = false
      state.error = null
    },
    fetchFacilitiesStart(state) {
      state.loading = true
      state.error = null
    },
    // Triggered when fetching or updating the grid fails
    taskOperationFailed(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
    },
    // Triggered to start the grid update process
    updateFacilitiesStart(state /*action: PayloadAction<GridType>*/) {
      state.loading = true
      state.error = null
    },
    addFacilityStart(state, action: PayloadAction<Facility>) {
      state.loading = true
      state.error = null
    },
    deleteFacilityStart(state, action: PayloadAction<Facility>) {
      state.loading = true
      state.error = null
    },
    updateFacilityStart(
      state,
      action: PayloadAction<{ id: string; data: any }>,
    ) {
      state.loading = true
      state.error = null
    },
    syncFacilitiesStart(state /*action: PayloadAction<GridType>*/) {
      state.loading = true
      state.error = null
    },
  },
})

// Export the actions
export const {
  upsertFacility,
  removeFacility,
  assignTaskToFacility,
  removeTaskFromFacility,
  setFacilities,
  fetchFacilitiesStart,
  taskOperationFailed,
  updateFacilitiesStart,
  addFacilityStart,
  deleteFacilityStart,
  updateFacilityStart,
  syncFacilitiesStart,
} = facilitiesSlice.actions

// Export the reducer
export default facilitiesSlice.reducer
