import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the Facility interface
export interface Facility {
  id: number;
  title: string;
  description: string;
  bgcolor: string;
  tasks: number[]; // Array of task IDs
}

// Define the state structure for facilities
interface FacilitiesState {
  facilities: {
    [id: number]: Facility;
  };
}

// Initial state for the facilities slice
const initialState: FacilitiesState = {
  facilities: {},
};

// Create the facilities slice
export const facilitiesSlice = createSlice({
  name: "facilities",
  initialState,
  reducers: {
    // Action to add or update a facility
    upsertFacility: (state, action: PayloadAction<Facility>) => {
      const facility = action.payload;
      // Initialize tasks array if not provided
      if (!facility.tasks) facility.tasks = [];
      state.facilities[facility.id] = facility;
    },
    // Action to remove a facility by its ID
    removeFacility: (state, action: PayloadAction<number>) => {
      delete state.facilities[action.payload];
    },
    // Action to assign a task to a facility
    assignTaskToFacility: (
      state,
      action: PayloadAction<{ facilityId: number; taskId: number }>
    ) => {
      const { facilityId, taskId } = action.payload;
      const facility = state.facilities[facilityId];
      if (facility && !facility.tasks.includes(taskId)) {
        facility.tasks.push(taskId);
      }
    },
    // Action to remove a task from a facility
    removeTaskFromFacility: (
      state,
      action: PayloadAction<{ facilityId: number; taskId: number }>
    ) => {
      const { facilityId, taskId } = action.payload;
      const facility = state.facilities[facilityId];
      if (facility) {
        facility.tasks = facility.tasks.filter((id) => id !== taskId);
      }
    },
  },
});

// Export the actions
export const {
  upsertFacility,
  removeFacility,
  assignTaskToFacility,
  removeTaskFromFacility,
} = facilitiesSlice.actions;

// Export the reducer
export default facilitiesSlice.reducer;
