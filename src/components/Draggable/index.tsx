import { useDraggable } from "@dnd-kit/core"
import { useAppSelector } from "../../hooks"
import { Task } from "../../slices/tasks"
import { Box } from "@mui/material"
import { Arrow } from "react-absolute-svg-arrows"
interface DraggableProps {
  children: React.ReactNode
  id: string
  data: {
    sourceId: string | null
    task: Task
  }
}

export function Draggable({ children, id, data }: DraggableProps) {
  const view = useAppSelector((state) => state.view.view)
  const disabled = useAppSelector((state) => state.drag.disabled)
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: data,
    disabled: disabled || data.task.projectId !== projectId,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <>
      <button
        ref={setNodeRef}
        style={{
          all: "unset",
          cursor:
            data.task.projectId === projectId && view?.isEditable
              ? "grab"
              : "default",
          zIndex: data.task.dragged ? 100 : 10,
          position: transform ? "fixed" : "initial",
          ...style,
        }}
        {...listeners}
        {...attributes}
      >
        <Box sx={{ position: "absolute", top: "50%" }}>
          <Arrow
            endPoint={{
              x: 0,
              y: 0,
            }}
            startPoint={{
              x: 0 - (transform ? transform.x : 0) + 50,
              y: 0 - (transform ? transform.y : 0) + 50,
            }}
            config={{
              strokeWidth: 2,
              arrowColor: "black",
            }}
          />
        </Box>
        {children}
      </button>
    </>
  )
}
