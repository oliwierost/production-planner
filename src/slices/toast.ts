import { AlertColor } from "@mui/material"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface ToastState {
  message: string
  severity: AlertColor
  open: boolean
}

const initialState: ToastState = {
  message: "",
  severity: "success",
  open: false,
}

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToastOpen: (
      state,
      action: PayloadAction<{
        message: string
        severity: AlertColor
      }>,
    ) => {
      state.message = action.payload.message
      state.severity = action.payload.severity
      state.open = true
    },
    setToastClose: (state) => {
      state.message = ""
      state.open = false
    },
  },
})

// Export the actions
export const { setToastOpen, setToastClose } = toastSlice.actions

// Export the reducer
export default toastSlice.reducer
