import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ParentAttributes, workspaceId } from "./workspaces"
import { Task } from "./tasks"
import { inviteId } from "./invites"
import { projectId } from "./projects"
// Define the Facility interface

export interface Condition {
  facilityAttribute: string
  operator: string
  taskAttribute: string
}

export interface Conditions {
  [key: projectId]: Condition[]
}

export interface Attribute {
  name: string
  value?: string
}

export interface Attributes {
  [key: string]: Attribute
}

export type facilityId = string
export interface Facility {
  id: facilityId
  workspaceId: workspaceId
  index?: number
  title: string
  description: string
  bgcolor: string
  tasks: string[] // Array of task IDs
  manpower: number
  inviteId?: inviteId
  attributes: Attributes
  conditions: Conditions
}

// Define the state structure for facilities
interface FacilitiesState {
  facilities: {
    [id: workspaceId]: {
      [id: facilityId]: Facility
    }
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
      if (!state.facilities[facility.workspaceId]) {
        state.facilities[facility.workspaceId] = {}
      }
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
    sortFacilities: (
      state,
      action: PayloadAction<{
        facilities: {
          [id: workspaceId]: {
            [id: facilityId]: Facility
          }
        }
        workspaceId: workspaceId
      }>,
    ) => {
      const { facilities, workspaceId } = action.payload
      const workspaceFacilities = Object.values(facilities[workspaceId])
      const sortedFacilities = workspaceFacilities.sort((a, b) => {
        if (a.bgcolor === b.bgcolor) {
          return a.title.localeCompare(b.title)
        } else {
          return a.bgcolor.localeCompare(b.bgcolor)
        }
      })
      const sortedFacilitiesObject = sortedFacilities.reduce(
        (acc, facility, index) => {
          // Create a new object with index property added
          const facilityWithIndex = { ...facility, index }
          acc[facility.id] = facilityWithIndex
          return acc
        },
        {} as { [id: facilityId]: Facility },
      )
      state.facilities[workspaceId] = sortedFacilitiesObject
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
    setCollabFacilities(state, action: PayloadAction<Facility[]>) {
      const facilities = action.payload
      for (const facility of facilities) {
        if (!state.facilities[facility.workspaceId]) {
          state.facilities[facility.workspaceId] = {}
        }
        state.facilities[facility.workspaceId][facility.id] = facility
      }
      state.loading = false
    },
    setFacilities(
      state,
      action: PayloadAction<{ [id: workspaceId]: { [id: string]: Facility } }>,
    ) {
      //add index property to each facility by bgcolor order

      const facilities = action.payload
      //sort facilities by bgcolor and add index property then convert to object
      state.facilities = { ...facilities, ...state.facilities }
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
    undropTasksFromFacilityStart(state, action: PayloadAction<Facility>) {
      console.info("undropTasksFromFacilityStart", action.payload)
      state.loading = true
      state.error = null
    },

    addFacilityStart(
      state,
      action: PayloadAction<{
        facility: Facility
        workspaceAttributes: ParentAttributes
      }>,
    ) {
      console.info("addFacilityStart", action.payload)
      state.loading = true
      state.error = null
    },
    deleteFacilityStart(state, action: PayloadAction<Facility>) {
      console.info("deleteFacilityStart", action.payload)
      state.loading = true
      state.error = null
    },
    updateFacilityStart(
      state,
      action: PayloadAction<{
        facility: Facility
        data: Partial<Facility>
        workspaceAttributes: ParentAttributes
      }>,
    ) {
      console.info("updateFacilityStart", action.payload)
      state.loading = true
      state.error = null
    },
    syncFacilitiesStart(state /*action: PayloadAction<GridType>*/) {
      state.loading = true
      state.error = null
    },
    syncCollabFacilitiesStart(state /*action: PayloadAction<GridType>*/) {
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
  sortFacilities,
  taskOperationFailed,
  undropTasksFromFacilityStart,
  updateFacilitiesStart,
  updateFacility,
  setCollabFacilities,
  addFacilityStart,
  deleteFacilityStart,
  updateFacilityStart,
  syncFacilitiesStart,
  syncCollabFacilitiesStart,
} = facilitiesSlice.actions

// Export the reducer
export default facilitiesSlice.reducer
