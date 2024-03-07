import { Active, useDraggable } from "@dnd-kit/core"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { useEffect } from "react"
import { setTaskDragged, setTaskDraggedStart } from "../../slices/tasks"
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
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <>
      <button
        ref={setNodeRef}
        style={{
          all: "unset",
          cursor: view?.isEditable ? "grab" : "initial",
          zIndex: 999,
          position: "fixed",
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
