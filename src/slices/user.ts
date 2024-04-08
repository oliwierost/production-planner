import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// Define the Task interface

export type userId = string
export interface Credentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  openProjectId: string | null
  openWorkspaceId: string | null
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
      state.loading = true
      state.error = null
    },
    syncUserStart: (state, action: PayloadAction<string | undefined>) => {
      state.loading = true
      state.error = null
    },
    signInStart: (state, action: PayloadAction<Credentials>) => {
      state.loading = true
      state.error = null
    },
    signOutStart: (state) => {
      state.loading = true
      state.error = null
    },
    setProjectOpenStart: (state, action: PayloadAction<string>) => {
      state.loading = true
      state.error = null
    },
    setWorkspaceOpenStart: (state, action: PayloadAction<string>) => {
      state.loading = true
      state.error = null
    },
  },
})

// Export the actions
export const {
  setUser,
  setProjectOpen,
  setWorkspaceOpen,
  initializeUserStart,
  syncUserStart,
  signInStart,
  signOutStart,
  setProjectOpenStart,
  setWorkspaceOpenStart,
} = userSlice.actions

// Export the reducer
export default userSlice.reducer
