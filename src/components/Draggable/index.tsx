import { useDraggable } from "@dnd-kit/core"
import { useAppSelector } from "../../hooks"
interface DraggableProps {
  children: React.ReactNode
  id: string
  data: any
}

export function Draggable({ children, id, data }: DraggableProps) {
  const view = useAppSelector((state) => state.view.view)
  const drag = useAppSelector((state) => state.drag)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: data,
    disabled: drag.disabled,
  })

  const style = transform
    ? {
        position: "fixed",
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 5,
        cursor: "none",
      }
    : undefined

  return (
    <>
      <button
        ref={setNodeRef}
        style={{
          all: "unset",
          cursor: drag.draggedTaskId ? "none" : "grab",
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
