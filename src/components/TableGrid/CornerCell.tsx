import { Box } from "@mui/material"

export function CornerCell() {
  return (
    <Box
      sx={{
        zIndex: 9999,
        minWidth: 225,
        maxWidth: 225,
        minHeight: 50,
        bgcolor: "#D9D9D9",
        boxSizing: "border-box",
        borderBottom: "1px solid black",
        borderRight: "1px solid black",
      }}
    />
  )
}
