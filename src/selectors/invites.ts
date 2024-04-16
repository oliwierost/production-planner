import { createSelector } from "reselect"
import { RootState } from "../store" // Adjust the import path based on your actual file structure

export const selectInvite = createSelector(
  [
    (state: RootState) => state.invites.invites,
    (_: RootState, inviteId: string | null | undefined) => ({
      inviteId,
    }),
  ],
  (invites, { inviteId }) => {
    if (!invites || !inviteId) return null

    return invites[inviteId] || null
  },
)
