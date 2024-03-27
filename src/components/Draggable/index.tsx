import { useDraggable } from "@dnd-kit/core"
import { useAppSelector } from "../../hooks"
import { Task } from "../../slices/tasks"

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
  const drag = useAppSelector((state) => state.drag)
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)
  const { disabled, draggedTask } = drag

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: data,
    disabled: disabled || data.task.projectId !== projectId || data.task.locked,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: "transform 0.07s ease-out",
      }
    : undefined

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          all: "unset",
          cursor:
            data.task.projectId === projectId &&
            view?.isEditable &&
            !data.task.locked &&
            !draggedTask
              ? "grab"
              : "none",
          zIndex: draggedTask?.id === data.task.id ? 100 : 30,
          position: transform ? "fixed" : "initial",
          ...style,
        }}
        {...listeners}
        {...attributes}
      >
        {children}
      </div>
    </>
  )
}
