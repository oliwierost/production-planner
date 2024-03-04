import { Draggable } from "../Draggable"
import { Droppable } from "../Droppable"
import { Task } from "../Task"
import { DroppedTask } from "../DroppedTask"
import { Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"

import { Task as TaskType } from "../../slices/tasks"
import { Deadlines } from "../Deadlines"
import { useState } from "react"

interface DataCellProps {
  draggedTask: {
    draggableId: string | null
    task: TaskType | null
  }
  cellWidth: number
  rowId: string | number
  date: string
}
export function DataCell({
  draggedTask,
  cellWidth,
  rowId,
  date,
}: DataCellProps) {
  const time = new Date(date).getTime()
  const cellKey = `${rowId}-${time}`
  const tasks = useAppSelector((state) => state.tasks.tasks)
  const cell = useAppSelector((state) => state.view.view?.cells?.[cellKey])
  const facilities = useAppSelector((state) => state.facilities.facilities)
  const rowIndex = facilities[rowId]?.index
  const lastIndex = Object.keys(facilities).length - 1
  const tasksInRow = facilities[rowId]?.tasks
  const tasksInCell = tasksInRow.filter((taskId) => {
    return time == tasks[taskId]?.startTime
  })

  const renderTask = (
    task: TaskType,
    left: number | undefined,
    width: number | undefined,
    idx: number,
  ) => {
    if (cell?.state == "occupied-start" && draggedTask.task?.id !== task?.id) {
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
}
