import { createSelector } from "reselect"
import { RootState } from "../store"

export const selectTasks = createSelector(
  [
    (state: RootState) => state.tasks.tasks,
    (_: RootState, projectId: string | null | undefined) => projectId,
  ],
  (tasks, projectId) => {
    if (!tasks || !projectId) return null
    return tasks[projectId] || null
  },
)
