import { createSelector } from "reselect"
import { RootState } from "../store" // Adjust the import path based on your actual file structure

export const selectWorkspace = createSelector(
  [
    (state: RootState) => state.workspaces.workspaces,
    (_: RootState, workspaceId: string | null | undefined) => ({
      workspaceId,
    }),
  ],
  (workspaces, { workspaceId }) => {
    if (!workspaces || !workspaceId) return null

    return workspaces[workspaceId] || null
  },
)
