import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { workspaceId } from "./workspaces"

export interface Project {
  id: string
  title: string
  description: string
}

export type projectId = string

interface ProjectsState {
  projects: {
    [id: workspaceId]: {
      [id: projectId]: Project
    }
  }
  loading: boolean
  error: string | null
}

// Initial state for the tasks slice
const initialState: ProjectsState = {
  projects: {},
  loading: false,
  error: null,
}

// Create the tasks slice
export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    upsertProject: (
      state,
      action: PayloadAction<{ workspaceId: workspaceId; project: Project }>,
    ) => {
      const { workspaceId, project } = action.payload
      if (!state.projects[workspaceId]) {
        state.projects[workspaceId] = {}
      }
      state.projects[workspaceId][project.id] = project
    },
    setProjects(
      state,
      action: PayloadAction<{
        [id: workspaceId]: { [id: projectId]: Project }
      }>,
    ) {
      state.projects = { ...state.projects, ...action.payload }
      state.loading = false
    },
    upsertProjectStart: (
      state,
      action: PayloadAction<{ workspaceId: workspaceId; project: Project }>,
    ) => {
      state.loading = true
      state.error = null
    },
    setProjectsStart: (
      state,
      action: PayloadAction<{ [id: string]: Project }>,
    ) => {
      state.loading = true
      state.error = null
    },
    syncProjectsStart: (state) => {
      state.loading = true
      state.error = null
    },
  },
})

// Export the actions
export const {
  upsertProject,
  setProjects,
  upsertProjectStart,
  setProjectsStart,
  syncProjectsStart,
} = projectsSlice.actions

// Export the reducer
export default projectsSlice.reducer
