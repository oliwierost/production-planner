import { Button, Typography } from "@mui/material"
import { CSSProperties } from "styled-components"

interface PrimaryButtonProps {
  disabled?: boolean
  type?: "submit" | "button" | "reset"
  width?: string
  height?: string
  px?: number
  py?: number
  fontVariant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body1"
    | "body2"
    | "button"
  fontWeight?: number
  label: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  sx?: CSSProperties
}

export function PrimaryButton({
  disabled = false,
  width = "100%",
  height = "fit-content",
  px = 10,
  py = 2,
  fontVariant = "body1",
  fontWeight = 500,
  label,
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
        bgcolor: "button.primary",
        width: width,
        height: height,
        "&:hover": {
          bgcolor: "button.hover",
          color: "button.primaryText",
        },
        //target touched
        "&:focus": {
          outline: "none",
        },
        borderRadius: 0,
        ...sx,
      }}
    >
      <Typography variant={fontVariant} fontWeight={fontWeight}>
        {label}
      </Typography>
    </Button>
  )
}
