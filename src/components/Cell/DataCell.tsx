import { Draggable } from "../Draggable"
import { Droppable } from "../Droppable"
import { Task } from "../Task"
import { DroppedTask } from "../DroppedTask"
import { Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"
import { Task as TaskType } from "../../slices/tasks"
import { Deadlines } from "../Deadlines"
import { useState } from "react"
import { isEqual } from "lodash"
import { useRenderCount } from "@uidotdev/usehooks"
import { memo } from "react"

interface DataCellProps {
  draggedTask: {
    draggableId: string | null
    task: TaskType | null
  }
  cellWidth: number
  rowId: string | number
  date: string
}
export const DataCell = memo(
  ({ draggedTask, cellWidth, rowId, date }: DataCellProps) => {
    const renderCount = useRenderCount()
    const time = new Date(date).getTime()
    const cellKey = `${rowId}-${time}`
    const tasks = useAppSelector((state) => state.tasks.tasks, isEqual)
    const cell = useAppSelector(
      (state) => state.view.view?.cells?.[cellKey],
      isEqual,
    )
    const facility = useAppSelector(
      (state) => state.facilities.facilities[rowId],
      isEqual,
    )
    const rowIndex = facility.index
    const lastIndex = 8
    const tasksInRow = facility.tasks
    const tasksInCell = tasksInRow.filter((taskId) => {
      const task = useAppSelector((state) => state.tasks.tasks[taskId], isEqual)
      return time == task.startTime
    })

    const renderTask = (
      task: TaskType,
      left: number | undefined,
      width: number | undefined,
      idx: number,
    ) => {
      if (
        cell?.state == "occupied-start" &&
        draggedTask.task?.id !== task?.id
      ) {
        return (
          <Draggable
            id={cellKey}
            key={cellKey + task?.id + idx}
            data={{
              task,
              sourceId: cellKey,
            }}
          >
            <DroppedTask
              task={task}
              cellWidth={cellWidth}
              left={left}
              width={width}
              rowId={rowId}
              colId={time}
            />
          </Draggable>
        )
      } else if (
        cell?.state == "occupied-start" &&
        draggedTask.task?.id === task?.id
      ) {
        return (
          <Draggable
            id={cellKey}
            key={cellKey + task?.id + idx}
            data={{
              task,
              sourceId: cellKey,
            }}
          >
            <Task task={task} />
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
        {renderCount}
        <Droppable id={cellKey}>
          <>
            {tasksInCell
              ? tasksInCell.map((taskInCell, idx) => {
                  const task = tasks[taskInCell]
                  return renderTask(task, 0, task.duration * cellWidth, idx)
                })
              : null}
          </>
        </Droppable>
        <Deadlines time={time} rowIndex={rowIndex} lastIndex={lastIndex} />
      </Stack>
    )
  },
)
