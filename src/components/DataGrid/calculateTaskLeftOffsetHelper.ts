export const calculateTaskLeftOffsetHelper = (
  taskStartTime: number,
  startTime: number,
  cellWidth: number,
  daysInCell: number,
) => {
  const dayInMiliseconds = 60 * 60 * 24 * 1000
  const daysDiff = Math.floor((taskStartTime - startTime) / dayInMiliseconds)
  return (cellWidth / daysInCell) * daysDiff
}
