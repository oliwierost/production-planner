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
