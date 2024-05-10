export const getWeek = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - startOfYear.getTime()
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  return Math.ceil(diff / oneWeek)
}

export const getMonth = (date: Date): string => {
  const month = date.toLocaleString("default", { month: "long" })
  return month.charAt(0).toUpperCase() + month.slice(1)
}

export const getYear = (date: Date): number => {
  return date.getFullYear()
}

export const generateMonthView = (startTime: number, endTime: number) => {
  const numOfCellsInViewport = 20
  const cellWidth = (window.innerWidth - 225) / numOfCellsInViewport
  const numOfCols = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24))

  const headerBottomData = [
    {
      field: "stand",
      headerName: "",
      date: 0,
      editable: false,
      sortable: false,
      width: 225,
      minWidth: 225,
    },
  ]

  headerBottomData.push(
    ...Array.from({ length: numOfCols }, (_, i) => {
      const date = new Date(startTime)
      date.setDate(date.getDate() + i)

      return {
        field: "date" + i,
        headerName: date.toLocaleDateString("pl-Pl", {
          day: "2-digit",
          month: "2-digit",
        }),
        date: date.getTime(),
        editable: false,
        sortable: false,
        width: cellWidth,
        minWidth: cellWidth,
      }
    }),
  )
  const headerTopData = headerBottomData.map((date) => {
    const week = getWeek(new Date(date.date))
    return "Tydzień " + week + " - " + getYear(new Date(date.date))
  })

  return {
    name: "1 mies.",
    headerTopData,
    headerBottomData,
    cellWidth,
    daysInCell: 1,
  }
}

export const generateQuarterYearView = (startTime: number, endTime: number) => {
  const numOfCellsInViewport = 12 // maximum is 12
  const cellWidth = (window.innerWidth - 225) / numOfCellsInViewport
  const numOfCols = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24 * 7))
  const headerBottomData = [
    {
      field: "stand",
      headerName: "",
      date: 0,
      editable: false,
      sortable: false,
      width: 225,
      minWidth: 225,
    },
  ]

  headerBottomData.push(
    ...Array.from({ length: numOfCols }, (_, i) => {
      const dateStart = new Date(startTime)
      dateStart.setDate(dateStart.getDate() + i * 7)
      return {
        field: "date" + i,
        headerName: dateStart.toLocaleDateString("pl-Pl"),
        date: dateStart.getTime(),
        editable: false,
        sortable: false,
        width: cellWidth,
        minWidth: cellWidth,
      }
    }),
  )
  const headerTopData = headerBottomData.map((date) => {
    const month = getMonth(new Date(date.date))
    return month + " - " + getYear(new Date(date.date))
  })

  return {
    name: "3 mies.",
    headerTopData,
    headerBottomData,
    cellWidth,
    daysInCell: 7,
  }
}

export const generateYearView = (startTime: number, endTime: number) => {
  const numOfCellsInViewport = 12 // maximum is 12
  const cellWidth = (window.innerWidth - 225) / numOfCellsInViewport
  const numOfCols = Math.ceil(
    (endTime - startTime) / (1000 * 60 * 60 * 24 * 30),
  )
  const headerBottomData = [
    {
      field: "stand",
      headerName: "",
      date: 0,
      editable: false,
      sortable: false,
      width: 225,
      minWidth: 225,
    },
  ]

  headerBottomData.push(
    ...Array.from({ length: numOfCols }, (_, i) => {
      const date = new Date(startTime)
      date.setMonth(date.getMonth() + i)
      return {
        field: "date" + i,
        headerName: getMonth(date),
        date: date.getTime(),
        editable: false,
        sortable: false,
        width: cellWidth,
        minWidth: cellWidth,
      }
    }),
  )
  const headerTopData = headerBottomData.map((date) => {
    const year = getYear(new Date(date.date))
    return `Rok ${year}`
  })

  return {
    name: "1 rok",
    headerTopData,
    headerBottomData,
    cellWidth,
    daysInCell: 30,
  }
}
