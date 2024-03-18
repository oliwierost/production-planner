import { Draggable } from "../Draggable"
import { Droppable } from "../Droppable"
import { DroppedTask } from "../DroppedTask"
import { Box, Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"
import { Task as TaskType } from "../../slices/tasks"
import { Deadlines } from "../Deadlines"
import { memo } from "react"
import { isEqual } from "lodash"
import { Cell } from "../../slices/grid"

interface DataCellProps {
  cellWidth: number
  rowId: string | number
  date: string
}

function getOccupiedStartCell(cell: Cell | undefined) {
  const cellState = cell?.state
  if (cellState === "occupied-start") {
    return cell
  } else {
    return null
  }
}

export const DataCell = memo(({ cellWidth, rowId, date }: DataCellProps) => {
  const time = new Date(date).getTime()
  const cellKey = `${rowId}-${time}`

  const cell = useAppSelector(
    (state) => getOccupiedStartCell(state.grid.grid?.cells?.[cellKey]),
    isEqual,
  )

  const rowIndex = useAppSelector(
    (state) => state.facilities.facilities[rowId].index,
    isEqual,
  )

  const facilitiesCount = useAppSelector(
    (state) => state.facilities.total,
    isEqual,
  )

  const renderTask = (task: TaskType, idx: number) => {
    if (cell?.state == "occupied-start") {
      return (
        <div key={cellKey + task?.id + idx}>
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
              />
            </Stack>
          </Draggable>
          {task.dragged ? (
            <Box sx={{ opacity: 0.5, zIndex: 20 }}>
              <DroppedTask
                task={task}
                cellWidth={cellWidth}
                rowId={rowId}
                colId={time}
              />
            </Box>
          ) : null}
        </div>
      )
    }
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
          {cell?.tasks
            ? Object.values(cell.tasks).map((taskInCell, idx) => {
                const task = taskInCell.task
                return renderTask(task, idx)
              })
            : null}
        </>
      </Droppable>
      <Deadlines time={time} rowIndex={rowIndex} lastIndex={facilitiesCount} />
    </Stack>
  )
})
