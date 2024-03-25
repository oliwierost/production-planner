export const calculateTaskWidthHelper = ({
  manpower,
  duration,
  cellWidth,
}: {
  manpower: number
  duration: number
  cellWidth: number
}) => {
  const taskWidth = (duration * cellWidth) / manpower
  const taskWidthRounded = Math.round(taskWidth / cellWidth) * cellWidth
  return taskWidthRounded < cellWidth ? cellWidth : taskWidthRounded
}
