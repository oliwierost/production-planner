import { useAppSelector } from "../../hooks"
import { selectFacility } from "../../selectors/facilities"
import { Task } from "../../slices/tasks"
import { Arrow as SvgArrow } from "react-absolute-svg-arrows"
import { getCoordsHelper } from "../DroppedTask/getCoordsHelper"

interface ArrowProps {
  fromTask: Task
  toTask: Task
  newDuration: number
}

export function Arrow({ fromTask, toTask, newDuration }: ArrowProps) {
  const fromFacility = useAppSelector((state) =>
    selectFacility(state, fromTask.workspaceId, fromTask.facilityId),
  )
  const toFacility = useAppSelector((state) =>
    selectFacility(state, toTask.workspaceId, toTask.facilityId),
  )
  const draggedTask = useAppSelector((state) => state.drag.draggedTask)
  const view = useAppSelector((state) => state.view.view)
  const delta = useAppSelector((state) => state.drag.delta)

  if (!fromFacility || !toFacility) {
    return null
  }
  const coords = getCoordsHelper({
    fromFacility,
    toFacility,
    fromTask,
    toTask,
    newDuration,
    view,
  })

  if (!view) return

  return (
    <SvgArrow
      startPoint={{
        x:
          draggedTask?.id == toTask.id || draggedTask == null
            ? coords.x - delta.x
            : draggedTask?.id == fromTask.id || draggedTask == null
            ? coords.x + delta.x
            : coords.x,
        y:
          draggedTask?.id == toTask.id || draggedTask == null
            ? coords.y - delta.y
            : draggedTask?.id == fromTask.id || draggedTask == null
            ? coords.y + delta.y
            : coords.y,
      }}
      endPoint={{ x: (newDuration - toTask.duration) * view?.cellWidth, y: 0 }}
      config={{
        strokeWidth: 2,
        arrowColor: "black",
        arrowHeadEndingSize: 10,
        dotEndingRadius: 5,
      }}
    />
  )
}
