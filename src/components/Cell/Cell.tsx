import { View } from "../../../types/view"
import { DraggedTask } from "../../App"
import { useAppSelector } from "../../hooks"
import { DataCell, HeadCell, SideCell } from "../Cell"
import { CornerCell } from "../TableGrid/CornerCell"

interface CellProps {
  colIndex: number
  rowId: string | number
  draggedTask: DraggedTask
  view: View
  column: any
  width: number
}

export function Cell({
  colIndex,
  draggedTask,
  view,
  column,
  width,
  rowId,
}: CellProps) {
  const facilitiesState = useAppSelector((state) => state.facilities)
  const facilities = facilitiesState.facilities
  const facility = facilities[rowId]

  if (rowId == 0 && colIndex == 0) {
    return <CornerCell />
  } else if (rowId == 0 && colIndex != 0) {
    return (
      <HeadCell
        cellWidth={width}
        columnIndex={colIndex}
        topData={view?.headerTopData}
        bottomLabel={column.headerName}
      />
    )
  } else if (rowId != 0 && colIndex == 0) {
    return <SideCell facility={facility} />
  } else {
    return (
      <DataCell
        rowId={rowId}
        draggedTask={draggedTask}
        cellWidth={width}
        date={column.date}
      />
    )
  }
}
