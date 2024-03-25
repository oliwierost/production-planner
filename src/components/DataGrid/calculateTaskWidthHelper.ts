export const calculateTaskWidthHelper = ({
  manpower,
  duration,
  cellWidth,
  daysInCell,
}: {
  manpower: number
  duration: number
  cellWidth: number
  daysInCell: number
}) => {
  const taskWidth = (duration * cellWidth) / manpower
  const taskWidthRounded = Math.round(taskWidth / cellWidth) * cellWidth
  return taskWidthRounded < cellWidth
    ? cellWidth / daysInCell
    : taskWidthRounded / daysInCell
}
