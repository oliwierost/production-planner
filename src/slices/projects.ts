import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface Project {
  id: string
  title: string
  description: string
}

interface ProjectsState {
  projects: {
    [id: string]: Project
  }
  selectedProject: string | null
  loading: boolean
  error: string | null
}

// Initial state for the tasks slice
const initialState: ProjectsState = {
  projects: {},
  selectedProject: null,
  loading: false,
  error: null,
}

// Create the tasks slice
export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    upsertProject: (state, action: PayloadAction<Project>) => {
      const project = action.payload
      state.projects[project.id] = project
    },
    setProjects(state, action: PayloadAction<{ [id: string]: Project }>) {
      state.projects = action.payload
      state.loading = false
    },
    setSelectedProject(state, action: PayloadAction<string | null>) {
      state.selectedProject = action.payload
    },
    upsertProjectStart: (
      state,
      action: PayloadAction<{ project: Project }>,
    ) => {
      state.loading = true
      state.error = null
      console.info("upsertProjectStart", action.payload)
    },
    setProjectsStart: (
      state,
      action: PayloadAction<{ [id: string]: Project }>,
    ) => {
      state.loading = true
      state.error = null
      console.info("setProjectsStart", action.payload)
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
  setSelectedProject,
  upsertProjectStart,
  setProjectsStart,
  syncProjectsStart,
} = projectsSlice.actions

// Export the reducer
export default projectsSlice.reducer
