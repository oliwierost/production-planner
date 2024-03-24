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

export const selectTask = createSelector(
  [
    (state: RootState) => state.tasks.tasks,
    (
      state: RootState,
      taskId: string | null | undefined,
      projectId: string | null | undefined,
    ) => {
      const tasks = state.tasks.tasks
      if (!tasks || !taskId || !projectId) return null
      return tasks[projectId] ? tasks[projectId][taskId] : null
    },
  ],

  (tasks, task) => {
    if (!tasks || !task) return null
    return task
  },
)

export const selectTasksByIds = createSelector(
  [
    (state: RootState) => state.tasks.tasks,
    (
      state: RootState,
      projectId: string | null | undefined,
      taskIds: string[],
    ) => {
      const tasks = state.tasks.tasks
      const selectedTasks = {} as { [taskId: string]: any }
      if (!tasks || !projectId || !taskIds) return null
      taskIds.forEach((taskId) => {
        if (tasks[projectId] && tasks[projectId][taskId]) {
          selectedTasks[taskId] = tasks[projectId][taskId]
        }
      })
      return selectedTasks
    },
  ],

  (_, tasksByIds) => {
    if (!tasksByIds) return null
    return tasksByIds
  },
)

export const selectTasksByIdsInWorkspace = createSelector(
  [
    (state: RootState) => state.tasks.tasks,
    (
      state: RootState,
      workspaceId: string | null | undefined,
      taskIds: string[],
    ) => {
      const tasks = state.tasks.tasks
      const selectedTasks = {} as { [taskId: string]: any }
      if (!tasks || !workspaceId || !taskIds) return null
      Object.keys(tasks).forEach((projectId) => {
        taskIds.forEach((taskId) => {
          if (tasks[projectId] && tasks[projectId][taskId]) {
            selectedTasks[taskId] = tasks[projectId][taskId]
          }
        })
      })
      return selectedTasks
    },
  ],

  (_, tasksByIds) => {
    if (!tasksByIds) return null
    return tasksByIds
  },
)
