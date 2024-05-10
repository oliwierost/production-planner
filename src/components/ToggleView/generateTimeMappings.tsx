export function generateWeekMapping(
  startTime: number,
  endTime: number,
): { [weekStart: number]: number[] } {
  const weekMapping: { [weekStart: number]: number[] } = {}
  let numOfDays = Math.ceil((endTime - startTime) / (24 * 60 * 60 * 1000))

  let currentDate = new Date(startTime)
  currentDate.setHours(0, 0, 0, 0)
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
export const generateMonthMapping = (startTime: number, endTime: number) => {
  const result: { [monthTimestamp: number]: number[] } = {}
  let numOfDays = Math.ceil((endTime - startTime) / (24 * 60 * 60 * 1000))

  for (let i = 0; i < numOfDays; i++) {
    const currentDate = new Date(startTime + i * 24 * 60 * 60 * 1000)
    currentDate.setHours(0, 0, 0, 0)

    const currentMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    )
    currentMonthDate.setHours(0, 0, 0, 0)

    if (!result[currentMonthDate.getTime()]) {
      result[currentMonthDate.getTime()] = [currentDate.getTime()]
    } else {
      result[currentMonthDate.getTime()].push(currentDate.getTime())
    }
  }

  return result
}
