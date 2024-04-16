import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { projectId } from "./projects"
import { taskId } from "./tasks"
import { workspaceId } from "./workspaces"
import { inviteId } from "./invites"
import { FormikHelpers } from "formik"
import { RaportFormData } from "../components/RaportModal"
import { Modal } from "../components/DataPanel"
import { userId } from "./user"

export type raportId = string

export interface Raport {
  id: raportId
  title: string
  comment: string
  prevProgress: number
  progress: number
  taskId: taskId
  projectId: projectId
  workspaceId: workspaceId
  inviteId?: inviteId
  raportingUserId: userId
  raportingUserEmail: string
  createdAt: number
}

interface ProjectsState {
  raports: {
    [id: taskId]: {
      [id: raportId]: Raport
    }
  }
  loading: boolean
  error: string | null
}

// Initial state for the tasks slice
const initialState: ProjectsState = {
  raports: {},
  loading: false,
  error: null,
}

// Create the tasks slice
export const raportsSlice = createSlice({
  name: "raports",
  initialState,
  reducers: {
    upsertRaport: (
      state,
      action: PayloadAction<{ taskId: taskId; raport: Raport }>,
    ) => {
      const { raport, taskId } = action.payload
      if (!state.raports[taskId]) {
        state.raports[taskId] = {}
      }
      state.raports[taskId][raport.id] = raport
    },
    setRaports(
      state,
      action: PayloadAction<{
        [id: taskId]: { [id: raportId]: Raport }
      }>,
    ) {
      state.raports = { ...state.raports, ...action.payload }
      state.loading = false
    },
    setRaport(state, action: PayloadAction<Raport>) {
      const raport = action.payload
      if (raport.workspaceId && !state.raports[raport.workspaceId]) {
        state.raports[raport.workspaceId] = {}
      }
      state.raports[raport.workspaceId][raport.id] = raport
      state.loading = false
    },
    setCollabRaports(state, action: PayloadAction<Raport[]>) {
      const raports = action.payload
      for (const raport of raports) {
        if (!state.raports[raport.taskId]) {
          state.raports[raport.taskId] = {}
        }
        state.raports[raport.taskId][raport.id] = raport
      }
      state.loading = false
    },
    upsertRaportStart: (
      state,
      action: PayloadAction<{
        raport: Raport
        resetForm: FormikHelpers<RaportFormData>["resetForm"]
        setModal: React.Dispatch<React.SetStateAction<Modal | null>>
      }>,
    ) => {
      console.info("upsertRaportStart", action.payload)
      state.loading = true
      state.error = null
    },
    setRaportsStart: (
      state,
      action: PayloadAction<{ [id: taskId]: Raport }>,
    ) => {
      console.info("setRaportsStart", action.payload)
      state.loading = true
      state.error = null
    },
    syncRaportsStart: (state) => {
      state.loading = true
      state.error = null
    },
    syncCollabRaportsStart: (state) => {
      state.loading = true
      state.error = null
    },
  },
})

// Export the actions
export const {
  upsertRaport,
  setRaports,
  setRaport,
  upsertRaportStart,
  setCollabRaports,
  setRaportsStart,
  syncRaportsStart,
  syncCollabRaportsStart,
} = raportsSlice.actions

// Export the reducer
export default raportsSlice.reducer
