import { isEqual } from "lodash"
import { useAppSelector } from "../../hooks"
import { selectFacility } from "../../selectors/facilities"
import { Facility } from "../Facility"

interface SideCellProps {
  rowId: string | number
}

export function SideCell({ rowId }: SideCellProps) {
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
  )

  const facility = useAppSelector(
    (state) => selectFacility(state, workspaceId, rowId as string),
    isEqual,
  )

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
