import { Box } from "@mui/material"

import { Draggable } from "../Draggable"
import { projectId } from "../../slices/projects"
import { Task } from "../../slices/tasks"

interface ResizeHandleProps {
  task: Task
  projectId: projectId
  isHovered: boolean
  isDragging: boolean
}

export function ResizeHandle({
  task,
  projectId,
  isHovered,
  isDragging,
}: ResizeHandleProps) {
  return (
    <Box
      sx={{
        position: "relative",
        minWidth: "10px",
        height: "22px",
        mr: 1,
        cursor: "col-resize",
      }}
    >
      <Draggable
        id={task.id + "handle"}
        data={{
          task: task,
          sourceId: null,
        }}
      >
        <Box
          minWidth={10}
          height="22px"
          sx={{
            borderRadius: "0 4px 4px 0",
            backgroundImage: `repeating-linear-gradient(45deg, ${
              task.projectId === projectId ? task.bgcolor : "grey.400"
            }, ${
              task.projectId === projectId ? task.bgcolor : "grey.400"
            } 2px, #000000 4px, #000000 2px)`,
            backgroundSize: "22px 22px",
            border: "1px solid black",
            boxSizing: "border-box",
            cursor: "col-resize",
            display:
              isHovered &&
              !isDragging &&
              task.projectId === projectId &&
              !task.dragged
                ? "block"
                : "none",
          }}
        />
      </Draggable>
    </Box>
  )
}
