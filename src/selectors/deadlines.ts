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
    (state: RootState) => state.deadlines.deadlines,
    (
      state: RootState,
      projectId: string | null | undefined,
      deadlineId: string | null | undefined,
    ) => {
      const deadlines = state.deadlines.deadlines
      if (!deadlines || !deadlineId || !projectId) return null

      return deadlines[projectId] ? deadlines[projectId][deadlineId] : null
    },
  ],

  (deadlines, deadline) => {
    if (!deadlines || !deadline) return null
    return deadline
  },
)
