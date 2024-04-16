import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { projectId } from "./projects"
import { workspaceId } from "./workspaces"

// Define the Task interface

export type userId = string
export interface Credentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  openUserId: userId | null
  openProjectId: projectId | null
  openWorkspaceId: workspaceId | null
}

// Define the state structure for tasks
interface UserState {
  user: User | null
  loading: boolean
  error: string | null
}

// Initial state for the tasks slice
const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
}

// Create the tasks slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      const user = action.payload
      state.loading = false
      state.user = user
    },
    setUserOpen: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.openUserId = action.payload
      }
    },
    setProjectOpen: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.openProjectId = action.payload
      }
    },
    setWorkspaceOpen: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.openWorkspaceId = action.payload
      }
    },
    initializeUserStart: (state, action: PayloadAction<Credentials>) => {
      console.info("initializeUserStart", action.payload)
      state.loading = true
      state.error = null
    },
    syncUserStart: (state, action: PayloadAction<string | undefined>) => {
      console.info("syncUserStart", action.payload)
      state.loading = true
      state.error = null
    },
    signInStart: (state, action: PayloadAction<Credentials>) => {
      console.info("signInStart", action.payload)
      state.loading = true
      state.error = null
    },
    signOutStart: (state) => {
      state.loading = true
      state.error = null
    },
    setOpenStart: (
      state,
      action: PayloadAction<{
        userId: userId | null
        projectId: projectId | null
        workspaceId: workspaceId | null
      }>,
    ) => {
      console.info("setUserOpenStart", action.payload)
      state.loading = true
      state.error = null
    },
  },
})

// Export the actions
export const {
  setUser,
  setUserOpen,
  setProjectOpen,
  setWorkspaceOpen,
  initializeUserStart,
  syncUserStart,
  signInStart,
  signOutStart,
  setOpenStart,
} = userSlice.actions

// Export the reducer
export default userSlice.reducer
