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
        Math.round(
          (transform.x + activeX - container.left + container.scrollX) /
            gridWidth,
        ) *
          gridWidth -
        activeX +
        container.left -
        container.scrollX,
      y:
        Math.round((transform.y + container.top) / gridHeight) * gridHeight +
        activeY -
        container.top,
    }
    return newTransform
  } else {
    return transform
  }
}
