import { createSelector } from "reselect"
import { RootState } from "../store"

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
