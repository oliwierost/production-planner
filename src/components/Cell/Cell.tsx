import { View } from "../../../types/view"
import { DataCell, HeadCell, SideCell } from "../Cell"
import { CornerCell } from "../Cell/CornerCell"

interface CellProps {
  colIndex: number
  rowId: string | number

  view: View
  column: any
  width: number
}

export function Cell({ colIndex, view, column, width, rowId }: CellProps) {
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
    return <SideCell rowId={rowId} />
  } else {
    return <DataCell rowId={rowId} cellWidth={width} date={column.date} />
  }
}
