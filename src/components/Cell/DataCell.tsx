import { Droppable } from "../Droppable"
import { Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"
import { Deadlines } from "../Deadlines"
import { memo } from "react"
import _, { isEqual } from "lodash"
import { selectTaskIdsFromCells } from "../../selectors/grid"
import { selectFacility } from "../../selectors/facilities"
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

  const facilitiesCount = useAppSelector(
    (state) => state.facilities.total,
    isEqual,
  )

  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
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

  const taskIds = useAppSelector((state) =>
    selectTaskIdsFromCells(state, workspaceId, facility?.id, taskTimestamps),
  )

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        width: cellWidth,
        height: 50,
        position: "relative",
        backgroundColor: "white",
        boxSizing: "border-box",
        borderRight: "1px solid #D9D9D9",
        borderBottom: "1px solid black",
        background: "white",
        userSelect: "none",
      }}
    >
      <Droppable id={cellKey}>
        <>
          {taskIds && taskIds.length > 0 && projectId
            ? taskIds.map((taskId, idx) => {
                return (
                  <TaskWithOverlay
                    key={idx}
                    taskId={taskId}
                    cellKey={cellKey}
                    cellWidth={cellWidth}
                    rowId={rowId as string}
                    time={time}
                    projectId={projectId}
                  />
                )
              })
            : null}
        </>
      </Droppable>
      <Deadlines time={time} rowIndex={rowIndex} lastIndex={facilitiesCount} />
    </Stack>
  )
})
