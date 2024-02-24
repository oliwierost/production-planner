import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface Workspace {
  id: string
  title: string
  description: string
  projects: string[]
  facilities: string[]
}

interface WorkspacesState {
  workspaces: {
    [id: string]: Workspace
  }
  loading: boolean
  error: string | null
}

const initialState: WorkspacesState = {
  workspaces: {},
  loading: false,
  error: null,
}

export const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    upsertWorkspace: (state, action: PayloadAction<Workspace>) => {
      const workspace = action.payload
      if (!workspace.projects) workspace.projects = []
      if (!workspace.facilities) workspace.facilities = []
      state.workspaces[workspace.id] = workspace
    },
    removeWorkspace: (state, action: PayloadAction<string>) => {
      delete state.workspaces[action.payload]
    },
    addProjectToWorkspace: (
      state,
      action: PayloadAction<{ workspaceId: string; projectId: string }>,
    ) => {
      const { workspaceId, projectId } = action.payload
      const workspace = state.workspaces[workspaceId]
      if (workspace && !workspace.projects.includes(projectId)) {
        workspace.projects.push(projectId)
      }
    },
    removeProjectFromWorkspace: (
      state,
      action: PayloadAction<{ workspaceId: string; projectId: string }>,
    ) => {
      const { workspaceId, projectId } = action.payload
      const workspace = state.workspaces[workspaceId]
      if (workspace) {
        workspace.projects = workspace.projects.filter((id) => id !== projectId)
      }
    },
    addFacilityToWorkspace: (
      state,
      action: PayloadAction<{ workspaceId: string; facilityId: string }>,
    ) => {
      const { workspaceId, facilityId } = action.payload
      const workspace = state.workspaces[workspaceId]
      if (workspace && !workspace.facilities.includes(facilityId)) {
        workspace.facilities.push(facilityId)
      }
    },
    removeFacilityFromWorkspace: (
      state,
      action: PayloadAction<{ workspaceId: string; facilityId: string }>,
    ) => {
      const { workspaceId, facilityId } = action.payload
      const workspace = state.workspaces[workspaceId]
      if (workspace) {
        workspace.facilities = workspace.facilities.filter(
          (id) => id !== facilityId,
        )
      }
    },
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      const workspaces = action.payload
      state.workspaces = workspaces.reduce(
        (acc, workspace) => ({ ...acc, [workspace.id]: workspace }),
        {},
      )
      state.loading = false
      state.error = null
    },
    fetchWorskpacesStart: (state) => {
      state.loading = true
      state.error = null
    },
    workspaceOperationFailed: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    updateWorkspacesStart: (state /*action: PayloadAction<Workspace>*/) => {
      state.loading = true
      state.error = null
    },
    addWorkspaceStart: (state, action: PayloadAction<Workspace>) => {
      state.loading = true
      state.error = null
    },
    deleteWorkspaceStart: (state, action: PayloadAction<Workspace>) => {
      state.loading = true
      state.error = null
    },
    updateWorkspaceStart: (
      state,
      action: PayloadAction<{ id: string; data: any }>,
    ) => {
      state.loading = true
      state.error = null
    },
  },
})

export const {
  upsertWorkspace,
  removeWorkspace,
  addProjectToWorkspace,
  removeProjectFromWorkspace,
  addFacilityToWorkspace,
  removeFacilityFromWorkspace,
  fetchWorskpacesStart,
  workspaceOperationFailed,
  updateWorkspacesStart,
  addWorkspaceStart,
  deleteWorkspaceStart,
  updateWorkspaceStart,
} = workspacesSlice.actions

export default workspacesSlice.reducer
