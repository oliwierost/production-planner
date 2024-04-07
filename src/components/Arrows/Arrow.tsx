import { useAppSelector } from "../../hooks"
import { selectFacility } from "../../selectors/facilities"
import { Task } from "../../slices/tasks"
import { Arrow as SvgArrow } from "react-absolute-svg-arrows"
import { getCoordsHelper } from "../DroppedTask/getCoordsHelper"
import { Facility } from "../../slices/facilities"
import { Box } from "@mui/material"
import { calculateTaskWidthHelper } from "../DataGrid/calculateTaskWidthHelper"
import { useEffect, useState } from "react"
import { isEqual } from "lodash"

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
  const [coords, setCoords] = useState({ x: 0, y: 0 })
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

  useEffect(() => {
    if (!view || !fromFacility || !toFacility) return
    console.log(fromFacility, toFacility)
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

    setCoords({
      x: startCoords.x + newTaskWidth,
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
  ])

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
