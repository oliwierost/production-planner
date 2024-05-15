import { Box, Stack } from "@mui/material"
import { Draggable } from "../Draggable"
import { DroppedTask } from "../DroppedTask"
import { taskId } from "../../slices/tasks"
import { useState } from "react"
import { useAppSelector } from "../../hooks"
import { selectTask } from "../../selectors/tasks"
import { facilityId } from "../../slices/facilities"

interface TaskWithOverlayProps {
  taskId: taskId
  cellKey: string
  cellWidth: number
  rowId: facilityId
  time: number
  projectId: string
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
  const [delta, setDelta] = useState<{
    startX: number
    deltaX: number
  }>({
    startX: 0,
    deltaX: 0,
  })

  const task = useAppSelector((state) => selectTask(state, taskId, projectId))

  if (!task) return null

  return (
    <Box height="100%" position="absolute" left={0}>
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
              delta={delta}
              setDelta={setDelta}
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
          delta={delta}
          setDelta={setDelta}
        />
      </Stack>
    </Box>
  )
}
