import { Box } from "@mui/material"
import { isEqual } from "lodash"
import { useEffect, useState } from "react"
import { Arrow as SvgArrow } from "react-absolute-svg-arrows"
import { useAppSelector } from "../../hooks"
import { selectFacility } from "../../selectors/facilities"
import { Facility } from "../../slices/facilities"
import { Task } from "../../slices/tasks"
import { calculateTaskWidthHelper } from "../DataGrid/calculateTaskWidthHelper"
import { getCoordsHelper } from "../DroppedTask/getCoordsHelper"
import { calculateTaskLeftOffsetHelper } from "../DataGrid/calculateTaskLeftOffsetHelper"

interface ArrowProps {
  fromTask: Task
  toTask: Task
  taskWidth: number
  overFacility: Facility | null
  colId: number
}

export function Arrow({
  fromTask,
  toTask,
  taskWidth,
  overFacility,
  colId,
}: ArrowProps) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)
  const fromFacility = useAppSelector((state) =>
    selectFacility(state, fromTask.workspaceId, fromTask.facilityId),
  )
  const toFacility = useAppSelector((state) =>
    selectFacility(state, toTask.workspaceId, toTask.facilityId),
  )
  const facilities = useAppSelector(
    (state) => state.facilities.facilities,
    isEqual,
  )

  const view = useAppSelector((state) => state.view.view)

  const toTaskLeftOffset = calculateTaskLeftOffsetHelper(
    toTask.startTime!,
    colId,
    view?.cellWidth!,
    view?.daysInCell!,
  )

  useEffect(() => {
    if (!view || !fromFacility || !toFacility) return
    const startCoords = getCoordsHelper({
      fromFacility,
      toFacility,
      fromTask,
      toTask,
      taskWidth,
      view,
      overFacility,
    })
    const newTaskWidth = calculateTaskWidthHelper({
      duration: fromTask.duration,
      cellWidth: view?.cellWidth,
      manpower: fromFacility?.manpower,
      daysInCell: view?.daysInCell,
    })
    const fromTaskLeftOffset = calculateTaskLeftOffsetHelper(
      fromTask.startTime!,
      colId,
      view.cellWidth!,
      view.daysInCell!,
    )

    setCoords({
      x: newTaskWidth + fromTaskLeftOffset,
      y: startCoords.y,
    })
  }, [
    fromFacility,
    toFacility,
    fromTask,
    toTask,
    taskWidth,
    view,
    overFacility,
    facilities,
    view?.name,
  ])

  if (!fromTask.facilityId || !fromTask.startTime || !coords) return null

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
      }}
    >
      <SvgArrow
        startPoint={coords}
        endPoint={{
          x: toTaskLeftOffset,
          y: 0,
        }}
        config={{
          strokeWidth: 1.5,
          arrowColor: coords.x <= view?.cellWidth! ? "black" : "#C70039",
          arrowHeadEndingSize: 10,
          dotEndingRadius: 3,
        }}
      />
    </Box>
  )
}
