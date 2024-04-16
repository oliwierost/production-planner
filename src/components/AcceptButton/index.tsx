import { Check } from "@mui/icons-material"
import { Button } from "@mui/material"
import { CSSProperties } from "styled-components"

interface PrimaryButtonProps {
  disabled?: boolean
  type?: "submit" | "button" | "reset"
  width?: string
  height?: string
  px?: number
  py?: number
  fontWeight?: number
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  sx?: CSSProperties
}

export function AcceptButton({
  disabled = false,
  width = "100%",
  height = "fit-content",
  px = 10,
  py = 2,
  onClick,
  type = "button",
  sx = {},
}: PrimaryButtonProps) {
  return (
    <Button
      type={type}
      disabled={disabled}
      onClick={onClick}
      variant="contained"
      sx={{
        px: px,
        py: py,
        bgcolor: "#4CBB17",
        width: width,
        height: height,
        //target touched
        "&:focus": {
          outline: "none",
        },
        borderRadius: 0,
        ...sx,
      }}
    >
      <Check />
    </Button>
  )
}
