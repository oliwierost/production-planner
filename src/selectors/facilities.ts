import { createSelector } from "reselect"
import { RootState } from "../store" // Adjust the import path based on your actual file structure

export const selectFacilities = createSelector(
  [
    (state: RootState) => state.facilities.facilities,
    (_: RootState, workspaceId: string | null | undefined) => workspaceId,
  ],
  (facilities, workspaceId) => {
    if (!facilities || !workspaceId) return null
    return facilities[workspaceId] || null
  },
)

export const selectFacility = createSelector(
  [
    (state: RootState) => state.facilities.facilities,
    (
      _: RootState,
      workspaceId: string | null | undefined,
      facilityId: string,
    ) => ({
      workspaceId,
      facilityId,
    }),
  ],
  (facilities, { workspaceId, facilityId }) => {
    if (!facilities || !workspaceId) return null

    const workspaceFacilities = facilities[workspaceId]
    if (!workspaceFacilities) return null

    return workspaceFacilities[facilityId] || null
  },
)
