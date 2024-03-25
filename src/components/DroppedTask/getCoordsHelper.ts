import { Facility } from "../../slices/facilities"
import { Task } from "../../slices/tasks"
import { View } from "../../slices/view"

export const getCoordsHelper = ({
  fromTask,
  toTask,
  fromFacility,
  toFacility,
  taskWidth,
  view,
}: {
  fromTask: Task
  toTask: Task
  fromFacility: Facility
  toFacility: Facility
  taskWidth: number
  view: View | null
  overFacility: Facility | null
}) => {
  const fromFacilityIndex = fromFacility.index!
  const toFacilityIndex = toFacility.index!
  const startTime = view?.headerBottomData[1].date!
  const fromTime = fromTask.startTime!
  const toTime = toTask.startTime!
  const dayInMiliseconds = 60 * 60 * 24 * 1000
  const coords = {
    x:
      -((toTime - startTime) / dayInMiliseconds) * view!.cellWidth +
      ((fromTime - startTime) / dayInMiliseconds) * view!.cellWidth +
      (fromTask.duration! / dayInMiliseconds) * taskWidth,
    y: (fromFacilityIndex - toFacilityIndex) * 50,
  }
  return coords
}
