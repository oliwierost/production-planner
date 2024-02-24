export interface Cell {
  state: string
  tasks: {
    [key: string]: {
      taskId: string
      left?: number
      width?: number
      duration: number
    }
  }
  source: string
}

export interface Grid {
  cells: {
    [key: string]: Cell
  }
}

export interface View {
  name: string
  headerTopData: Array<string>
  headerBottomData: Array<{
    field: string
    headerName: string
    date: number
    editable: boolean
    sortable: boolean
    width: number
    minWidth: number
  }>
  cells?: {
    [key: string]: Cell
  }
  cellWidth: number
  isEditable?: boolean
}
