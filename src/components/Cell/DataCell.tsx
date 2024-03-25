import { Draggable } from "../Draggable"
import { Droppable } from "../Droppable"
import { DroppedTask } from "../DroppedTask"
import { Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"
import { Task as TaskType } from "../../slices/tasks"
import { Deadlines } from "../Deadlines"
import { memo } from "react"
import _, { isEqual } from "lodash"
import { selectTasksFromCells } from "../../selectors/grid"
import { selectFacility } from "../../selectors/facilities"
import { selectTimestampsFromMapping } from "../../selectors/view"

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
    selectTasksFromCells(state, workspaceId, facility?.id, taskTimestamps),
  )

  const renderTask = (task: TaskType, idx: number) => {
    return (
      <>
        <Draggable
          id={cellKey}
          data={{
            task,
            sourceId: cellKey,
          }}
        >
          <Stack height="100%" width={cellWidth}>
            <DroppedTask
              task={task}
              cellWidth={cellWidth}
              rowId={rowId}
              colId={time}
              isOverlay={false}
            />
          </Stack>
        </Draggable>
        <DroppedTask
          task={task}
          cellWidth={cellWidth}
          rowId={rowId}
          colId={time}
          isOverlay
        />
      </>
    )
  }
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
          {tasks && !_.isEmpty(tasks)
            ? Object.values(tasks).map((task, idx) => {
                return renderTask(task, idx)
              })
            : null}
        </>
      </Droppable>
      <Deadlines time={time} rowIndex={rowIndex} lastIndex={facilitiesCount} />
    </Stack>
  )
})
