export const calculateTaskDurationHelper = ({
  manpower,
  duration,
}: {
  manpower: number
  duration: number
}) => {
  if (manpower === 0) {
    return 0
  }
  const roundedDuration = Math.round(duration / manpower)
  if (roundedDuration === 0 || roundedDuration < 1) {
    return 1
  }
  return roundedDuration
}
