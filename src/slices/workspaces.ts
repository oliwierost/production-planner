import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { userId } from "./user"

export interface ParentAttribute {
  name: string
  options?: string[]
}

export interface ParentAttributes {
  [key: string]: ParentAttribute
}

export type workspaceId = string

export interface Workspace {
  id: workspaceId
  title: string
  description: string
  inviteId?: string
  ownerId: userId
  displayArrows: boolean
  facilityAttributes?: ParentAttributes
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

    setWorkspaces(state, action: PayloadAction<{ [id: string]: Workspace }>) {
      state.workspaces = {
        ...state.workspaces,
        ...action.payload,
      }
      state.loading = false
    },
    setWorkspace(state, action: PayloadAction<Workspace>) {
      const workspace = action.payload
      if (!state.workspaces[workspace.id]) {
        state.workspaces[workspace.id] = workspace
      }
      state.loading = false
    },
    upsertWorkspaceStart: (state, action: PayloadAction<Workspace>) => {
      console.info("upsertWorkspaceStart", action.payload)
      state.loading = true
      state.error = null
    },
    setWorkspacesStart: (
      state,
      action: PayloadAction<{ [id: string]: Workspace }>,
    ) => {
      console.info("setWorkspacesStart", action.payload)
      state.loading = true
      state.error = null
    },
    setWorkspaceAttributes: (
      state,
      action: PayloadAction<{
        workspaceId: workspaceId
        attributes: ParentAttributes
      }>,
    ) => {
      const { workspaceId, attributes } = action.payload
      state.workspaces[workspaceId].facilityAttributes = attributes
    },
    setDisplayArrows: (
      state,
      action: PayloadAction<{
        workspaceId: workspaceId
        displayArrows: boolean
      }>,
    ) => {
      const { workspaceId, displayArrows } = action.payload
      state.workspaces[workspaceId].displayArrows = displayArrows
    },
    setDisplayArrowsStart: (
      state,
      action: PayloadAction<{
        workspaceId: workspaceId
        displayArrows: boolean
      }>,
    ) => {
      console.info("setDisplayArrowsStart", action.payload)
      state.loading = true
      state.error = null
    },
    syncWorkspacesStart: (state) => {
      state.loading = true
      state.error = null
    },
    syncCollabWorkspacesStart: (state) => {
      state.loading = true
      state.error = null
    },
  },
})

// Export the actions
export const {
  upsertWorkspace,
  setWorkspace,
  upsertWorkspaceStart,
  setWorkspacesStart,
  setDisplayArrows,
  setWorkspaceAttributes,
  syncWorkspacesStart,
  setDisplayArrowsStart,
  syncCollabWorkspacesStart,
  setWorkspaces,
} = workspacesSlice.actions

// Export the reducer
export default workspacesSlice.reducer
