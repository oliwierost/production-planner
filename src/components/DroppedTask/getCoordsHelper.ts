import { Facility } from "../../slices/facilities"
import { Task } from "../../slices/tasks"
import { View } from "../../slices/view"
import { Task } from "../Task"

export const getCoordsHelper = ({
  fromTask,
  toTask,
  fromFacility,
  toFacility,
  newDuration,
  view,
}: {
  fromTask: Task
  toTask: Task
  fromFacility: Facility
  toFacility: Facility
  newDuration: number
  view: View | null
}) => {
  const fromFacilityIndex = fromFacility.index!
  const toFacilityIndex = toFacility.index!

  const startTime = view?.headerBottomData[1].date!
  const fromTime = fromTask.startTime!
  const toTime = toTask.startTime!
  const duration = fromTask.duration
  const coords = {
    x:
      -((toTime - startTime) / (60 * 60 * 24 * 1000)) * view!.cellWidth +
      ((fromTime - startTime) / (60 * 60 * 24 * 1000)) * view!.cellWidth +
      duration * view!.cellWidth,
    y: (fromFacilityIndex - toFacilityIndex) * 50,
  }
  return coords
}
