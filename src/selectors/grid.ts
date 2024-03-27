import { createSelector } from "reselect"
import { RootState } from "../store"
import { Task, taskId } from "../slices/tasks"

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

export const selectTaskIdsFromCells = createSelector(
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

    const tasks = [] as taskId[]
    timestamps.forEach((timestamp) => {
      const cellKey = `${facilityId}-${timestamp}`
      const cell = workspaceCells[cellKey]

      if (cell && cell.state === "occupied-start" && cell.taskId) {
        tasks.push(cell.taskId)
      }
    })

    return tasks
  },
)

export const getDaysToNextDefinedCell = createSelector(
  [
    (state: RootState) => state.grid.grid,
    (
      _: RootState,
      timestamp: number | null | undefined,
      facilityId: string | null | undefined,
      workspaceId: string | null | undefined,
      taskId: string | null | undefined,
    ) => ({ timestamp, facilityId, workspaceId, taskId }),
  ],
  (grid, { timestamp, facilityId, workspaceId, taskId }) => {
    if (!grid || !timestamp || !facilityId || !workspaceId || !taskId)
      return null
    const cellKey = `${facilityId}-${timestamp}`
    const cell = grid[workspaceId]?.cells?.[cellKey]

    if (!cell) return null // If current cell is undefined, return null

    // Find the next timestamp with a defined cell
    let nextTimestamp = timestamp + 86400000 //day in milis
    let nextCellKey = `${facilityId}-${nextTimestamp}`
    let nextCell = grid[workspaceId]?.cells?.[nextCellKey]

    // Loop until you find the next defined cell or reach the end of the grid
    while (!nextCell || nextCell.taskId == taskId) {
      nextTimestamp += 86400000
      nextCellKey = `${facilityId}-${nextTimestamp}`
      nextCell = grid[workspaceId]?.cells?.[nextCellKey]
    }

    // Calculate the number of days to the next defined cell
    const daysToNextDefinedCell = nextCell ? nextTimestamp - timestamp : null

    return daysToNextDefinedCell
  },
)
