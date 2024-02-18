import { Button, Typography } from "@mui/material"

interface SecondaryButtonProps {
  width?: string | number
  height?: string | number
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

export function SecondaryButton({
  width = "100%",
  height = "fit-content",
  px = 10,
  py = 2,
  fontVariant = "body1",
  fontWeight = 500,
  label,
  onClick,
}: SecondaryButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outlined"
      sx={{
        px: px,
        py: py,
        borderColor: "button.primary",
        bgcolor: "button.secondary",
        color: "button.secondaryText",
        width: width,
        height: height,
        "&:hover": {
          bgcolor: "button.hover",
          borderColor: "button.hover",
          color: "button.primaryText",
        },
        "&:focus": {
          outline: "none",
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
