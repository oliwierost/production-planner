import { Box, Stack } from "@mui/material"
import { Draggable } from "../Draggable"
import { DroppedTask } from "../DroppedTask"
import { Task, taskId } from "../../slices/tasks"
import { useState } from "react"
import { useAppSelector } from "../../hooks"
import { selectTask } from "../../selectors/tasks"
import { facilityId } from "../../slices/facilities"
import { projectId } from "../../slices/projects"

interface TaskWithOverlayProps {
  taskId: taskId
  cellKey: string
  cellWidth: number
  rowId: facilityId
  time: number
  projectId: projectId
}

export function TaskWithOverlay({
  taskId,
  cellKey,
  cellWidth,
  rowId,
  time,
  projectId,
}: TaskWithOverlayProps) {
  const [isResized, setIsResized] = useState(false)

  const task = useAppSelector((state) => selectTask(state, taskId, projectId))

  if (!task) return null
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
            isResized={isResized}
            setIsResized={setIsResized}
            task={task}
            cellWidth={cellWidth}
            rowId={rowId}
            colId={time}
            isOverlay={false}
          />
        </Stack>
      </Draggable>
      <Box position="absolute" zIndex={20}>
        <DroppedTask
          isResized={isResized}
          setIsResized={setIsResized}
          task={task}
          cellWidth={cellWidth}
          rowId={rowId}
          colId={time}
          isOverlay
        />
      </Box>
    </>
  )
}
