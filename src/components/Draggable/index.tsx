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
  const disabled = useAppSelector((state) => state.drag.disabled)
  const selectedProject = useAppSelector(
    (state) => state.projects.selectedProject,
  )

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: data,
    disabled: disabled || data.task.projectId !== selectedProject,
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
            data.task.projectId === selectedProject && view?.isEditable
              ? "grab"
              : "default",
          zIndex: data.task.dragged ? 100 : 10,
          position: transform ? "fixed" : "initial",
          ...style,
        }}
        {...listeners}
        {...attributes}
      >
        {children}
      </button>
    </>
  )
}
