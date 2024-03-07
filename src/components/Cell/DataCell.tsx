import { Draggable } from "../Draggable"
import { Droppable } from "../Droppable"
import { Task } from "../Task"
import { DroppedTask } from "../DroppedTask"
import { Box, Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"
import { Task as TaskType } from "../../slices/tasks"
import { Deadlines } from "../Deadlines"
import { useRenderCount } from "@uidotdev/usehooks"
import { memo, useEffect, useState } from "react"
import { isEqual } from "lodash"
import { Active } from "@dnd-kit/core"
import { Cell } from "../../slices/grid"

interface DataCellProps {
  cellWidth: number
  rowId: string
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

  const renderTask = (
    task: TaskType,
    left: number | undefined,
    width: number | undefined,
    idx: number,
  ) => {
    if (cell?.state == "occupied-start") {
      return (
        <Draggable
          id={cellKey}
          key={cellKey + task?.id + idx}
          data={{
            task,
            sourceId: cellKey,
          }}
        >
          <Stack height="100%" width={cellWidth}>
            <DroppedTask
              task={task}
              cellWidth={cellWidth}
              left={left}
              width={width}
              rowId={rowId}
              colId={time}
            />
          </Stack>
        </Draggable>
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
                return renderTask(task, 0, task.duration * cellWidth, idx)
              })
            : null}
        </>
      </Droppable>
      <Deadlines time={time} rowIndex={rowIndex} lastIndex={facilitiesCount} />
    </Stack>
  )
})
