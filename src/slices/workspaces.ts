import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { PartialUpdate, Workspace } from "../../types"

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
      console.log("upsertWorkspace", action.payload)
    },
    removeWorkspace: (state, action: PayloadAction<string>) => {
      delete state.workspaces[action.payload]
      console.log("removeWorkspace", action.payload)
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
      console.log("addProjectToWorkspace", action.payload)
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
      console.log("removeProjectFromWorkspace", action.payload)
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
      console.log("addFacilityToWorkspace", action.payload)
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
      console.log("removeFacilityFromWorkspace", action.payload)
    },
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      const workspaces = action.payload
      state.workspaces = workspaces.reduce(
        (acc, workspace) => ({ ...acc, [workspace.id]: workspace }),
        {},
      )
      state.loading = false
      state.error = null
      console.log("setWorkspaces", action.payload)
    },
    fetchWorskpacesStart: (state) => {
      state.loading = true
      state.error = null
      console.log("fetchWorskpacesStart")
    },
    workspaceOperationFailed: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
      console.log("workspaceOperationFailed", action.payload)
    },
    updateWorkspacesStart: (state /*action: PayloadAction<Workspace>*/) => {
      state.loading = true
      state.error = null
      console.log("updateWorkspacesStart")
    },
    addWorkspaceStart: (state, action: PayloadAction<Workspace>) => {
      state.loading = true
      state.error = null
      console.log("addWorkspaceStart", action.payload)
    },
    deleteWorkspaceStart: (state, action: PayloadAction<Workspace>) => {
      state.loading = true
      state.error = null
      console.log("deleteWorkspaceStart", action.payload)
    },
    updateWorkspaceStart: (
      state,
      action: PayloadAction<{ id: string; data: PartialUpdate<Workspace> }>,
    ) => {
      state.loading = true
      state.error = null
      console.log("updateWorkspaceStart", action.payload)
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
