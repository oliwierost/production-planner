import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface Project {
  id: string
  title: string
  description: string
  facilities: string[]
  tasks: string[]
  workspaceId: string
}

interface ProjectsState {
  projects: {
    [id: string]: Project
  }
  loading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  projects: {},
  loading: false,
  error: null,
}

export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    upsertProject: (state, action: PayloadAction<Project>) => {
      const project = action.payload
      if (!project.facilities) project.facilities = []
      if (!project.tasks) project.tasks = []
      state.projects[project.id] = project
    },
    removeProject: (state, action: PayloadAction<string>) => {
      delete state.projects[action.payload]
    },
    addFacilityToProject: (
      state,
      action: PayloadAction<{ projectId: string; facilityId: string }>,
    ) => {
      const { projectId, facilityId } = action.payload
      const project = state.projects[projectId]
      if (project && !project.facilities.includes(facilityId)) {
        project.facilities.push(facilityId)
      }
    },
    removeFacilityFromProject: (
      state,
      action: PayloadAction<{ projectId: string; facilityId: string }>,
    ) => {
      const { projectId, facilityId } = action.payload
      const project = state.projects[projectId]
      if (project) {
        project.facilities = project.facilities.filter(
          (id) => id !== facilityId,
        )
      }
    },
    addTaskToProject: (
      state,
      action: PayloadAction<{ projectId: string; taskId: string }>,
    ) => {
      const { projectId, taskId } = action.payload
      const project = state.projects[projectId]
      if (project && !project.tasks.includes(taskId)) {
        project.tasks.push(taskId)
      }
    },
    removeTaskFromProject: (
      state,
      action: PayloadAction<{ projectId: string; taskId: string }>,
    ) => {
      const { projectId, taskId } = action.payload
      const project = state.projects[projectId]
      if (project) {
        project.tasks = project.tasks.filter((id) => id !== taskId)
      }
    },
    setProjects: (state, action: PayloadAction<{ [id: string]: Project }>) => {
      state.projects = action.payload
      state.loading = false
      state.error = null
    },
    fetchProjectsStart: (state) => {
      state.loading = true
      state.error = null
    },
    projectOperationFailed: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    updateProjectsStart: (state, action: PayloadAction<Project>) => {
      state.loading = true
      state.error = null
    },
    addProjectStart: (state, action: PayloadAction<Project>) => {
      state.loading = true
      state.error = null
    },
    deleteProjectStart: (state, action: PayloadAction<string>) => {
      state.loading = true
      state.error = null
    },
    updateProjectStart: (
      state,
      action: PayloadAction<{ id: string; data: any }>,
    ) => {
      state.loading = true
      state.error = null
    },
  },
})
