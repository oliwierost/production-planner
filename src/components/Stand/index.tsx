import { Stand as StandType } from "../../../types/stand"
import { Stack, Typography } from "@mui/material"

interface StandProps {
  stand: StandType
}

export function Stand({ stand }: StandProps) {
  return (
    <Stack
      minWidth="7rem"
      height="4rem"
      justifyContent="center"
      px={3}
      sx={{
        bgcolor: stand.bgcolor,
        color: "#FFFFFF",
        ml: "-1px",
      }}
    >
      <Typography variant="body2" fontWeight={700}>
        {stand.title}
      </Typography>
    </Stack>
  )
}