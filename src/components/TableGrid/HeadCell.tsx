import { Box, Stack, Typography } from "@mui/material"

interface HeadCellProps {
  cellWidth: number
  columnIndex: number
  topData: string[]
  bottomLabel: string
}

export function HeadCell({
  cellWidth,
  columnIndex,
  topData,
  bottomLabel,
}: HeadCellProps) {
  return (
    <Stack
      sx={{
        minWidth: cellWidth,
        minHeight: 50,
        bgcolor: "#D9D9D9",
        boxSizing: "border-box",
        borderBottom: "1px solid black",
        userSelect: "none",
        left: 225,
      }}
    >
      <Stack
        height="100%"
        width="100%"
        sx={{
          boxSizing: "border-box",
          justifyContent: "center",
          borderRight:
            topData[columnIndex + 1] == topData[columnIndex]
              ? "none"
              : "1px solid black",
          borderBottom: "1px solid black",
          pl: 1,
        }}
      >
        {topData[columnIndex] !== topData[columnIndex - 1] &&
        columnIndex != 1 ? (
          <Stack position="relative">
            <Typography
              variant="body2"
              bottom="100%"
              position="absolute"
              sx={{
                transform: "translateY(50%)",
              }}
              noWrap
            >
              {topData[columnIndex]}
            </Typography>
          </Stack>
        ) : null}
      </Stack>
      <Stack
        height="100%"
        justifyContent="center"
        alignItems="center"
        sx={{ borderRight: "1px solid black" }}
      >
        <Typography variant="body2" noWrap textOverflow="clip">
          {bottomLabel}
        </Typography>
      </Stack>
    </Stack>
  )
}
