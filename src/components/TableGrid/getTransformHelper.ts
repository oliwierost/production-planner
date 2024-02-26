import { Over } from "@dnd-kit/core"

export interface GetTransformHelper {
  transform: Transform
  over: Over | null
  activeX: number
  activeY: number
  container: {
    left: number
    scrollX: number
    top: number
    scrollY: number
  }
  gridWidth: number
  gridHeight: number
  isDropped: boolean
}

export interface Transform {
  x: number
  y: number
  scaleX: number
  scaleY: number
}

export const getTransform = ({
  transform,
  over,
  activeX,
  activeY,
  container,
  gridWidth,
  gridHeight,
}: GetTransformHelper): Transform => {
  if (over) {
    const newTransform = {
      ...transform,
      x:
        Math.ceil((transform.x - container.left + activeX) / gridWidth) *
          gridWidth +
        container.left -
        activeX -
        container.scrollX,
      y:
        Math.ceil((transform.y - container.top + activeY) / gridHeight) *
          gridHeight +
        container.top -
        activeY,
    }
    return newTransform
  } else {
    return transform
  }
}
