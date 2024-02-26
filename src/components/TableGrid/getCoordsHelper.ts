export interface Point {
  x: number
  y: number
}

export interface Coordinates {
  topLeft: Point
  topRight: Point
  bottomLeft: Point
  bottomRight: Point
}

export function getCoords(current: HTMLDivElement): Coordinates {
  const rect = current.getBoundingClientRect()
  return {
    topLeft: { x: rect.left, y: rect.top },
    topRight: { x: rect.right, y: rect.top },
    bottomLeft: { x: rect.left, y: rect.bottom },
    bottomRight: { x: rect.right, y: rect.bottom },
  }
}
