import { createSelector } from "reselect"
import { RootState } from "../store" // Adjust the import path based on your actual file structure

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
