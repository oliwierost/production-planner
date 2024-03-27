import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { workspaceId } from "./workspaces"
import { Task } from "./tasks"

// Define the Facility interface

export type facilityId = string
export interface Facility {
  id: facilityId
  workspaceId: workspaceId
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
    [id: workspaceId]: {
      [id: facilityId]: Facility
    }
  }
  total: number
  loading: boolean
  error: string | null
}

// Initial state for the facilities slice
const initialState: FacilitiesState = {
  facilities: {},
  total: 0,
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
      state.facilities[facility.workspaceId][facility.id] = facility
    },
    // Action to remove a facility by its ID
    removeFacility: (
      state,
      action: PayloadAction<{
        facilityId: facilityId
        workspaceId: workspaceId
      }>,
    ) => {
      const { facilityId, workspaceId } = action.payload
      delete state.facilities[workspaceId][facilityId]
    },
    updateFacility: (
      state,
      action: PayloadAction<{
        facility: Facility
        data: any
      }>,
    ) => {
      const { facility, data } = action.payload
      if (facility) {
        state.facilities[facility.workspaceId][facility.id] = {
          ...facility,
          ...data,
        }
      }
    },
    // Action to assign a task to a facility
    assignTaskToFacility: (
      state,
      action: PayloadAction<{
        facilityId: string
        task: Task
      }>,
    ) => {
      const { facilityId, task } = action.payload
      const facility = state.facilities[task.workspaceId][facilityId]
      if (facility && !facility.tasks.includes(task.id)) {
        facility.tasks.push(task.id)
      }
    },
    // Action to remove a task from a facility
    removeTaskFromFacility: (
      state,
      action: PayloadAction<{
        facilityId: string
        task: Task
      }>,
    ) => {
      const { facilityId, task } = action.payload
      const facility = state.facilities[task.workspaceId][facilityId]
      if (facility) {
        facility.tasks = facility.tasks.filter((id) => id !== task.id)
      }
    },
    setFacilities(
      state,
      action: PayloadAction<{ [id: workspaceId]: { [id: string]: Facility } }>,
    ) {
      //add index property to each facility by bgcolor order

      const facilities = action.payload
      //sort facilities by bgcolor and add index property then convert to object
      const facilitiesArray = Object.values(facilities)
      state.facilities = { ...facilities, ...state.facilities }
      state.total = facilitiesArray.length - 1
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
      action: PayloadAction<{ facility: Facility; data: any }>,
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
  updateFacility,
  addFacilityStart,
  deleteFacilityStart,
  updateFacilityStart,
  syncFacilitiesStart,
} = facilitiesSlice.actions

// Export the reducer
export default facilitiesSlice.reducer
