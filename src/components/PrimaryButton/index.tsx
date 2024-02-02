import { Button, Typography } from "@mui/material"

interface PrimaryButtonProps {
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
}

export function PrimaryButton({
  width = "100%",
  height = "fit-content",
  px = 10,
  py = 2,
  fontVariant = "body1",
  fontWeight = 500,
  label,
  onClick,
}: PrimaryButtonProps) {
  return (
    <Button
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
        borderRadius: 0,
      }}
    >
      <Typography variant={fontVariant} fontWeight={fontWeight}>
        {label}
      </Typography>
    </Button>
  )
}
