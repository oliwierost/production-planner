import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { Facility, PartialUpdate } from "../../types"

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
      console.log("upsertFacility", action.payload)
    },
    // Action to remove a facility by its ID
    removeFacility: (state, action: PayloadAction<string>) => {
      delete state.facilities[action.payload]
      console.log("removeFacility", action.payload)
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
      console.log("assignTaskToFacility", action.payload)
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
      console.log("removeTaskFromFacility", action.payload)
    },
    setFacilities(state, action: PayloadAction<{ [id: string]: Facility }>) {
      //add index property to each facility by bgcolor order
      const facilities = action.payload
      const facilitiesArray = Object.values(facilities)
      facilitiesArray.sort((a, b) => {
        return a.bgcolor.localeCompare(b.bgcolor)
      })
      facilitiesArray.forEach((facility, index) => {
        facility.index = index
      })
      state.facilities = facilities
      state.loading = false
      state.error = null
      console.log("setFacilities", action.payload)
    },
    fetchFacilitiesStart(state) {
      state.loading = true
      state.error = null
      console.log("fetchFacilitiesStart")
    },
    // Triggered when fetching or updating the grid fails
    taskOperationFailed(state, action: PayloadAction<string>) {
      state.loading = false
      state.error = action.payload
      console.log("taskOperationFailed", action.payload)
    },
    // Triggered to start the grid update process
    updateFacilitiesStart(state /*action: PayloadAction<GridType>*/) {
      state.loading = true
      state.error = null
      console.log("updateFacilitiesStart")
    },
    addFacilityStart(state, action: PayloadAction<Facility>) {
      state.loading = true
      state.error = null
      console.log("addFacilityStart", action.payload)
    },
    deleteFacilityStart(state, action: PayloadAction<Facility>) {
      state.loading = true
      state.error = null
      console.log("deleteFacilityStart", action.payload)
    },
    updateFacilityStart(
      state,
      action: PayloadAction<{ id: string; data: PartialUpdate<Facility> }>,
    ) {
      state.loading = true
      state.error = null
      console.log("updateFacilityStart", action.payload)
    },
    syncFacilitiesStart(state /*action: PayloadAction<GridType>*/) {
      state.loading = true
      state.error = null
      console.log("syncFacilitiesStart")
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
