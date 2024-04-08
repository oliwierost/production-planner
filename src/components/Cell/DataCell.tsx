import { Droppable } from "../Droppable"
import { Box, Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"
import { Deadlines } from "../Deadlines"
import { memo } from "react"
import _, { isEqual } from "lodash"
import { selectTaskIdsFromCells } from "../../selectors/grid"
import {
  selectFacilitiesCount,
  selectFacility,
} from "../../selectors/facilities"
import { selectTimestampsFromMapping } from "../../selectors/view"
import { TaskWithOverlay } from "../TaskWithOverlay"

interface DataCellProps {
  cellWidth: number
  rowId: string | number
  date: string
}

export const DataCell = memo(({ cellWidth, rowId, date }: DataCellProps) => {
  const time = new Date(date).getTime()
  const cellKey = `${rowId}-${time}`

  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
    isEqual,
  )

  const facilitiesCount = useAppSelector(
    (state) => selectFacilitiesCount(state, workspaceId),
    isEqual,
  )

  const projectId = useAppSelector(
    (state) => state.user.user?.openProjectId,
    isEqual,
  )

  const facility = useAppSelector(
    (state) => selectFacility(state, workspaceId, rowId as string),
    isEqual,
  )
  const rowIndex = facility?.index

  const taskTimestamps = useAppSelector(
    (state) => selectTimestampsFromMapping(state, time),
    isEqual,
  )

  const tasks = useAppSelector((state) =>
    selectTaskIdsFromCells(state, workspaceId, facility?.id, taskTimestamps),
  )

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      position="relative"
      sx={{
        width: cellWidth,
        height: 50,
        backgroundColor: "white",
        boxSizing: "border-box",
        borderRight: "1px solid #D9D9D9",
        borderBottom: "1px solid black",
        background: "white",
        userSelect: "none",
      }}
    >
      <Droppable id={cellKey}>
        <Box position="relative" height="100%">
          {tasks && tasks.length > 0 && projectId
            ? tasks.map((task, idx) => {
                return (
                  <Box>
                    <TaskWithOverlay
                      key={idx}
                      taskId={task.taskId}
                      cellKey={cellKey}
                      cellWidth={cellWidth}
                      rowId={rowId as string}
                      time={time}
                      projectId={task.projectId}
                    />
                  </Box>
                )
              })
            : null}
        </Box>
      </Droppable>
      <Deadlines
        time={time}
        rowIndex={rowIndex}
        lastIndex={facilitiesCount - 1}
      />
    </Stack>
  )
})
