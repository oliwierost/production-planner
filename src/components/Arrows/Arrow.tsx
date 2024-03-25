import { useAppSelector } from "../../hooks"
import { selectFacility } from "../../selectors/facilities"
import { Task } from "../../slices/tasks"
import { Arrow as SvgArrow } from "react-absolute-svg-arrows"
import { getCoordsHelper } from "../DroppedTask/getCoordsHelper"
import { Facility } from "../../slices/facilities"
import { Box } from "@mui/material"
import { calculateTaskWidthHelper } from "../DataGrid/calculateTaskWidthHelper"

interface ArrowProps {
  fromTask: Task
  toTask: Task
  taskWidth: number
  overFacility: Facility | null
}

export function Arrow({
  fromTask,
  toTask,
  taskWidth,
  overFacility,
}: ArrowProps) {
  const fromFacility = useAppSelector((state) =>
    selectFacility(state, fromTask.workspaceId, fromTask.facilityId),
  )
  const toFacility = useAppSelector((state) =>
    selectFacility(state, toTask.workspaceId, toTask.facilityId),
  )

  const view = useAppSelector((state) => state.view.view)

  if (!fromFacility || !toFacility) {
    return null
  }
  const coords = getCoordsHelper({
    fromFacility,
    toFacility,
    fromTask,
    toTask,
    taskWidth,
    view,
    overFacility,
  })

  if (!view) return

  return (
    <Box sx={{ position: "absolute", top: "0", left: "0" }}>
      <SvgArrow
        startPoint={{
          x:
            coords.x +
            calculateTaskWidthHelper({
              duration: fromTask.duration,
              cellWidth: view?.cellWidth,
              manpower: fromFacility?.manpower,
            }),
          y: coords.y,
        }}
        endPoint={{
          x: 0,
          y: 0,
        }}
        config={{
          strokeWidth: 2,
          arrowColor: "black",
          arrowHeadEndingSize: 10,
          dotEndingRadius: 5,
        }}
      />
    </Box>
  )
}
