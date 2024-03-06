import { useAppSelector } from "../../hooks"
import { Facility as FacilityType } from "../../slices/facilities"
import { Facility } from "../Facility"

interface SideCellProps {
  rowId: string | number
}

export function SideCell({ rowId }: SideCellProps) {
  const facilitiesState = useAppSelector((state) => state.facilities)
  const facilities = facilitiesState.facilities
  const facility = facilities[rowId]
  return (
    <div
      style={{
        width: 225,
        boxSizing: "border-box",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
      }}
    >
      <Facility facility={facility} />
    </div>
  )
}
