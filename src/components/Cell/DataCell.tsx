import { Draggable } from "../Draggable"
import { Droppable } from "../Droppable"
import { Task } from "../Task"
import { DroppedTask } from "../DroppedTask"
import { Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"
import { Task as TaskType } from "../../slices/tasks"
import { Deadlines } from "../Deadlines"
import { useRenderCount } from "@uidotdev/usehooks"
import { memo, useState } from "react"
import { isEqual } from "lodash"
import { Active } from "@dnd-kit/core"
import { getRowIdFromRowModel } from "@mui/x-data-grid/internals"

interface DataCellProps {
  cellWidth: number
  rowId: string | number
  date: string
}

function findTasksWithStartTime(
  tasksObject: { [id: string]: TaskType },
  startTime: number,
  facilityId: string,
) {
  const tasksWithStartTime = []
  for (const taskId in tasksObject) {
    if (tasksObject.hasOwnProperty(taskId)) {
      const task = tasksObject[taskId]
      if (task.startTime === startTime && task.facilityId === facilityId) {
        tasksWithStartTime.push(task)
      }
    }
  }
  return tasksWithStartTime
}

export const DataCell = memo(({ cellWidth, rowId, date }: DataCellProps) => {
  const [activeDrag, setActiveDrag] = useState<Active | null>(null)
  const renderCount = useRenderCount()
  const time = new Date(date).getTime()
  const cellKey = `${rowId}-${time}`
  const tasks = useAppSelector(
    (state) => findTasksWithStartTime(state.tasks.tasks, time, rowId),
    isEqual,
  )
  const cell = useAppSelector(
    (state) => state?.grid?.grid?.cells?.[cellKey],
    isEqual,
  )

  const rowIndex = useAppSelector(
    (state) => state.facilities.facilities[rowId].index,
    isEqual,
  )
  const lastIndex = 7

  const renderTask = (
    task: TaskType,
    left: number | undefined,
    width: number | undefined,
    idx: number,
  ) => {
    if (
      cell?.state == "occupied-start" &&
      activeDrag?.data.current?.task?.id !== task?.id
    ) {
      return (
        <Draggable
          id={cellKey}
          key={cellKey + task?.id + idx}
          data={{
            task,
            sourceId: cellKey,
          }}
          setActiveDrag={setActiveDrag}
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
      activeDrag?.data.current?.task?.id === task?.id
    ) {
      return (
        <Draggable
          id={cellKey}
          key={cellKey + task?.id + idx}
          data={{
            task,
            sourceId: cellKey,
          }}
          setActiveDrag={setActiveDrag}
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
          {tasks
            ? tasks.map((task, idx) => {
                return renderTask(task, 0, task.duration * cellWidth, idx)
              })
            : null}
        </>
      </Droppable>
      <Deadlines time={time} rowIndex={rowIndex} lastIndex={lastIndex} />
    </Stack>
  )
})
