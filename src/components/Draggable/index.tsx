import { useDraggable } from "@dnd-kit/core"
import { useAppSelector } from "../../hooks"

interface DraggableProps {
  children: React.ReactNode
  id: string
  data: any
}

export function Draggable({ children, id, data }: DraggableProps) {
  const view = useAppSelector((state) => state.view.view)
  const disabled = useAppSelector((state) => state.drag.disabled)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: data,
    disabled: disabled,
  })

  const style = transform
    ? {
        position: "fixed",
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        cursor: "none",
      }
    : undefined

  return (
    <>
      <button
        ref={setNodeRef}
        style={{
          all: "unset",
          cursor: view?.isEditable ? "grab" : "initial",
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
