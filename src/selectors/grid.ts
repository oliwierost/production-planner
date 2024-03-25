import { createSelector } from "reselect"
import { RootState } from "../store"
import { Task } from "../slices/tasks"

export const selectGrid = createSelector(
  [
    (state: RootState) => state.grid.grid,
    (_: RootState, workspaceId: string | null | undefined) => workspaceId,
  ],
  (grid, workspaceId) => {
    if (!grid || !workspaceId) return null
    return grid[workspaceId] || null
  },
)

export const selectCell = createSelector(
  [
    (state: RootState) => state.grid.grid,
    (
      _: RootState,
      workspaceId: string | null | undefined,
      cellKey: string,
    ) => ({ workspaceId, cellKey }),
  ],
  (grid, { workspaceId, cellKey }) => {
    if (!grid || !workspaceId || !cellKey) return null

    const workspaceCells = grid[workspaceId]?.cells
    if (!workspaceCells) return null

    const cell = workspaceCells[cellKey]
    if (cell && cell.state === "occupied-start") {
      return cell
    } else {
      return null
    }
  },
)

export const selectTasksFromCells = createSelector(
  [
    (state: RootState) => state.grid.grid,
    (
      _: RootState,
      workspaceId: string | null | undefined,
      facilityId: string | null | undefined,
      timestamps: number[] | null | undefined,
    ) => ({ workspaceId, facilityId, timestamps }),
  ],
  (grid, { workspaceId, facilityId, timestamps }) => {
    if (!grid || !workspaceId || !facilityId || !timestamps) return null

    const workspaceCells = grid[workspaceId]?.cells
    if (!workspaceCells) return null

    const tasks = {} as { [taskId: string]: Task }
    timestamps.forEach((timestamp) => {
      const cellKey = `${facilityId}-${timestamp}`
      const cell = workspaceCells[cellKey]

      if (cell && cell.state === "occupied-start") {
        Object.values(cell.tasks).forEach((task) => {
          const taskData = task.task
          tasks[taskData.id] = taskData
        })
      }
    })

    return tasks
  },
)
