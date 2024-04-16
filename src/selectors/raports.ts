import { taskId } from "../slices/tasks"
import { RootState } from "../store"
import { createSelector } from "reselect"

export const selectRaports = createSelector(
  [
    (state: RootState) => state.raports.raports,
    (_: RootState, taskId: taskId | null | undefined) => taskId,
  ],
  (raports, taskId) => {
    if (!raports || !taskId) return null
    return raports[taskId] || null
  },
)
