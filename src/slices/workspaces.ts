import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface Workspace {
  id: string
  title: string
  description: string
}

interface WorkspacesState {
  workspaces: {
    [id: string]: Workspace
  }
  loading: boolean
  error: string | null
}

// Initial state for the tasks slice
const initialState: WorkspacesState = {
  workspaces: {},
  loading: false,
  error: null,
}

// Create the tasks slice
export const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    upsertWorkspace: (state, action: PayloadAction<Workspace>) => {
      const workspace = action.payload
      state.workspaces[workspace.id] = workspace
    },
    upsertWorkspaceStart: (state, action: PayloadAction<Workspace>) => {
      state.loading = true
      state.error = null
      console.info("upsertWorkspaceStart", action.payload)
    },
  },
})

// Export the actions
export const { upsertWorkspace, upsertWorkspaceStart } = workspacesSlice.actions

// Export the reducer
export default workspacesSlice.reducer
