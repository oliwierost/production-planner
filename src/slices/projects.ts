import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { userId } from "./user"
import { workspaceId } from "./workspaces"

export interface Project {
  id: string
  title: string
  description: string
  invitedUsers: userId[]
  workspaceId: workspaceId
  inviteId?: string
  ownerId: userId
  startTime: number
  endTime: number
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
    setProject(state, action: PayloadAction<Project>) {
      const project = action.payload
      if (project.workspaceId && !state.projects[project.workspaceId]) {
        state.projects[project.workspaceId] = {}
      }
      state.projects[project.workspaceId][project.id] = project
      state.loading = false
    },
    addInvitedUserToProject: (
      state,
      action: PayloadAction<{
        workspaceId: workspaceId
        projectId: projectId
        invitedUserId: userId
      }>,
    ) => {
      const { workspaceId, projectId, invitedUserId } = action.payload
      if (!state.projects[workspaceId][projectId].invitedUsers) {
        state.projects[workspaceId][projectId].invitedUsers = []
      }
      state.projects[workspaceId][projectId].invitedUsers.push(invitedUserId)
    },
    removeInvitedUserFromProject: (
      state,
      action: PayloadAction<{
        workspaceId: workspaceId
        projectId: projectId
        userId: userId
      }>,
    ) => {
      const { workspaceId, projectId, userId } = action.payload
      state.projects[workspaceId][projectId].invitedUsers = state.projects[
        workspaceId
      ][projectId].invitedUsers.filter((id) => id !== userId)
    },
    upsertProjectStart: (
      state,
      action: PayloadAction<{ workspaceId: workspaceId; project: Project }>,
    ) => {
      console.info("upsertProjectStart", action.payload)
      state.loading = true
      state.error = null
    },
    setProjectsStart: (
      state,
      action: PayloadAction<{ [id: string]: Project }>,
    ) => {
      console.info("setProjectsStart", action.payload)
      state.loading = true
      state.error = null
    },
    syncProjectsStart: (state) => {
      state.loading = true
      state.error = null
    },
    syncCollabProjectsStart: (state) => {
      state.loading = true
      state.error = null
    },
  },
})

// Export the actions
export const {
  upsertProject,
  setProjects,
  setProject,
  upsertProjectStart,
  addInvitedUserToProject,
  removeInvitedUserFromProject,
  setProjectsStart,
  syncProjectsStart,
  syncCollabProjectsStart,
} = projectsSlice.actions

// Export the reducer
export default projectsSlice.reducer
