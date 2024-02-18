import { Modal as MuiModal, Stack } from "@mui/material"

interface ModalProps {
  open: boolean
  children: React.ReactNode
  onClose: () => void
}

export function Modal({ open, children, onClose }: ModalProps) {
  return (
    <MuiModal
      open={open}
      onClose={() => onClose()}
      sx={{
        "& .MuiBackdrop-root": {
          bgcolor: "transparent",
        },
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        width="fit-content"
        position="absolute"
        top="50%"
        left="50%"
        sx={{
          transform: "translate(-50%, -50%)",
        }}
        border="1px solid #1E1E1E"
        boxShadow={16}
      >
        {children}
      </Stack>
    </MuiModal>
  )
}
