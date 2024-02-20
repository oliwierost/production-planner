import { Box, Stack } from "@mui/material"
import { Droppable } from "../Droppable"

export function Timeline() {
  const numOfRows = 10
  return (
    <Box sx={{ overflowX: "scroll" }} height="100%" width="100%">
      <Stack width="10000px" height="100%">
        {Array.from({ length: numOfRows }).map((_, idx) => (
          <Stack
            minHeight="100px"
            width="100%"
            borderBottom="1px solid black"
            justifyContent="flex-end"
          >
            <Box minHeight={idx == 0 ? "50px" : "100px"}>
              <Droppable id={idx.toString()}>{idx}</Droppable>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
