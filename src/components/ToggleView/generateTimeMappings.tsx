export function generateWeekMapping(
  numOfDays: number,
  startDate: Date,
): { [weekStart: number]: number[] } {
  const weekMapping: { [weekStart: number]: number[] } = {}

  let currentDate = new Date(startDate)
  while (numOfDays > 0) {
    const weekStartTimestamp = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    )
    if (!(weekStartTimestamp.getTime() in weekMapping)) {
      weekMapping[weekStartTimestamp.getTime()] = []
    }
    for (let i = 0; i < 7 && numOfDays > 0; i++) {
      weekMapping[weekStartTimestamp.getTime()].push(currentDate.getTime())
      currentDate.setDate(currentDate.getDate() + 1)
      numOfDays--
    }
  }
  return weekMapping
}
export const generateMonthMapping = (numOfDays: number, startDate: Date) => {
  const result: { [monthTimestamp: number]: number[] } = {}

  for (let i = 0; i < numOfDays; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    currentDate.setHours(0, 0, 0, 0)
    const currentTimestamp = currentDate.getTime()
    const currentMonthTimestamp = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
    ).getTime()

    if (!result[currentMonthTimestamp]) {
      result[currentMonthTimestamp] = [currentTimestamp]
    } else {
      result[currentMonthTimestamp].push(currentTimestamp)
    }
  }

  return result
}
