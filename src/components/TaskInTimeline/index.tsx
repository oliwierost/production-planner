import { Box, Stack } from "@mui/material"
import { Task } from "../../slices/tasks"
import { Draggable } from "../Draggable"
import { DroppedTask } from "../DroppedTask"
import { useEffect, useState } from "react"
import { useAppSelector } from "../../hooks"

interface TaskInTimelineProps {
  task: Task
}

export function TaskInTimeline({ task }: TaskInTimelineProps) {
  const [taskRect, setTaskRect] = useState({ left: 0, top: 0, width: 0 })

  const view = useAppSelector((state) => state.view.view)
  const facilities = useAppSelector((state) => state.facilities.facilities)

  useEffect(() => {
    if (task) {
      const colIdx = view?.headerBottomData.findIndex(
        (data) => data.date === task.startTime,
      )!
      const rowIdx = Object.values(facilities).findIndex(
        (facility) => facility.id === task.facilityId,
      )
      const left = colIdx ? colIdx * 100 : 0
      const top = rowIdx ? rowIdx * 50 : 0
      const width = task.duration * 100
      setTaskRect({ left, top, width })
    }
  }, [task, view, facilities])

  return (
    <Box position="absolute" top={taskRect.top} left={taskRect.left}>
      <Draggable id={task.id} data={null}>
        <Stack maxWidth="50px" height="100%" m="auto">
          <DroppedTask task={task} key={task.id} taskRect={taskRect} />
        </Stack>
      </Draggable>
    </Box>
  )
}
