import { Stack } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

interface TitleBarProps {
  onClose: () => void
}

export function TitleBar({ onClose }: TitleBarProps) {
  return (
    <Stack
      direction="row-reverse"
      width="100%"
      height="fit-content"
      bgcolor="#5A5A5A"
    >
      <CloseIcon
        sx={{
          color: "white",
          alignSelf: "center",
          justifySelf: "flex-end",
          p: 0.5,
          cursor: "pointer",
        }}
        onClick={() => onClose()}
      />
    </Stack>
  )
}
