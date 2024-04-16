import { createSelector } from "reselect"
import { RootState } from "../store" // Adjust the import path based on your actual file structure

export const selectProject = createSelector(
  [
    (state: RootState) => state.projects.projects,
    (
      _: RootState,
      workspaceId: string | null | undefined,
      projectId: string | null | undefined,
    ) => ({
      workspaceId,
      projectId,
    }),
  ],
  (projects, { workspaceId, projectId }) => {
    if (!projects || !workspaceId || !projectId) return null

    const workspaceProjects = projects[workspaceId]
    if (!workspaceProjects) return null

    return workspaceProjects[projectId] || null
  },
)
