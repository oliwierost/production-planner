import { createSelector } from "reselect"
import { RootState } from "../store"

export const selectDeadlines = createSelector(
  [
    (state: RootState) => state.deadlines.deadlines,
    (_: RootState, projectId: string | null | undefined) => projectId,
  ],
  (deadlines, projectId) => {
    if (!deadlines || !projectId) return null
    return deadlines[projectId] || null
  },
)

export const selectDeadline = createSelector(
  [
    (state: RootState) => state.tasks.tasks,
    (
      state: RootState,
      taskId: string | null | undefined,
      projectId: string | null | undefined,
    ) => {
      const deadlines = state.deadlines.deadlines
      if (!deadlines || !taskId || !projectId) return null
      return deadlines[projectId] ? deadlines[projectId][taskId] : null
    },
  ],

  (deadlines, task) => {
    if (!deadlines || !task) return null
    return task
  },
)
