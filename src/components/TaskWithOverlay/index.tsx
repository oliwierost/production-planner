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
    <Box height="100%">
      <Stack
        position="absolute"
        height="100%"
        maxWidth={cellWidth}
        justifyContent="center"
      >
        <Draggable
          id={taskId + "-cell"}
          data={{
            task,
            sourceId: cellKey,
          }}
        >
          <Box maxWidth={cellWidth} height="100%">
            <DroppedTask
              isResized={isResized}
              setIsResized={setIsResized}
              task={task}
              cellWidth={cellWidth}
              rowId={rowId}
              colId={time}
              isOverlay={false}
            />
          </Box>
        </Draggable>
      </Stack>
      <Stack
        position="absolute"
        height="100%"
        maxWidth={cellWidth}
        justifyContent="center"
        zIndex={20}
      >
        <DroppedTask
          isResized={isResized}
          setIsResized={setIsResized}
          task={task}
          cellWidth={cellWidth}
          rowId={rowId}
          colId={time}
          isOverlay
        />
      </Stack>
    </Box>
  )
}
