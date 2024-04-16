import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { projectId } from "./projects"
import { userId } from "./user"
import { FormikHelpers } from "formik"
import { CollabFormData } from "../components/AddCollabModal"
import { Modal } from "../components/DataPanel"

export type inviteId = string
// Define the Task interface
export interface Invite {
  id: string
  invitingUserEmail: string
  invitingUserId: userId
  invitedUserEmail: string
  invitedUserId: userId
  projectId: projectId
  workspaceId: string
  permissions: "odczyt" | "edycja" | "raportowanie"
  status: "pending" | "accepted" | "rejected"
  type: "incoming" | "outgoing"
}

// Define the state structure for tasks
interface InvitesState {
  invites: {
    [id: inviteId]: Invite
  }
  loading: boolean
  error: string | null
}

// Initial state for the tasks slice
const initialState: InvitesState = {
  invites: {},
  loading: false,
  error: null,
}

// Create the tasks slice
export const invitesSlice = createSlice({
  name: "invites",
  initialState,
  reducers: {
    setInvites: (
      state,
      action: PayloadAction<{
        [id: inviteId]: Invite
      }>,
    ) => {
      state.invites = action.payload
      state.loading = false
    },
    syncInvitesStart: (state) => {
      state.loading = true
      state.error = null
    },
    acceptInvite: (state, action: PayloadAction<Invite>) => {
      state.invites[action.payload.id].status = "accepted"
      state.loading = false
    },
    rejectInvite: (state, action: PayloadAction<Invite>) => {
      state.invites[action.payload.id].status = "rejected"
      state.loading = false
    },
    acceptInviteStart: (state, action: PayloadAction<Invite>) => {
      console.info("acceptInviteStart", action.payload)
      state.loading = true
      state.error = null
    },
    rejectInviteStart: (state, action: PayloadAction<Invite>) => {
      console.info("rejectInviteStart", action.payload)
      state.loading = true
      state.error = null
    },
    inviteUserStart: (
      state,
      action: PayloadAction<{
        invite: Invite
        resetForm: FormikHelpers<CollabFormData>["resetForm"]
        setModal: React.Dispatch<React.SetStateAction<Modal | null>>
      }>,
    ) => {
      state.loading = true
      state.error = null
      console.info("inviteUserStart", action.payload)
    },
  },
})

// Export the actions
export const {
  inviteUserStart,
  setInvites,
  acceptInvite,
  rejectInvite,
  acceptInviteStart,
  rejectInviteStart,
  syncInvitesStart,
} = invitesSlice.actions

// Export the reducer
export default invitesSlice.reducer
