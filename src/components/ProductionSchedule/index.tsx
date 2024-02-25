import React from "react"
import {
  Stack,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material"
import { Stand } from "../Stand"
import { Stand as StandType } from "../../../types/stand"

interface GroupedData {
  date: Date
  groupedHours: number[]
}

interface WeekData {
  weekNumber: number
  dates: Date[]
}

interface ProductionScheduleProps {
  stands: StandType[]
}

export function ProductionSchedule({ stands }: ProductionScheduleProps) {
  const numberOfDays: number = 20

  const generateDateRange = (numberOfDays: number): Date[] => {
    const currentDate = new Date()
    const dateRange = Array.from({ length: numberOfDays }, (_, index) => {
      const date = new Date(currentDate)
      date.setDate(currentDate.getDate() + index)
      return date
    })
    return dateRange
  }

  const dateRange: Date[] = generateDateRange(numberOfDays)

  const groupDaysAndHours = (dateRange: Date[]): GroupedData[] => {
    const groupedData: GroupedData[] = []
    dateRange.forEach((date) => {
      const groupedHours = Array.from({ length: 24 }, (_, index) => index)
      groupedData.push({ date, groupedHours })
    })
    return groupedData
  }

  const groupedData: GroupedData[] = groupDaysAndHours(dateRange)

  const getISOWeek = (date: Date): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const diff = date.getTime() - startOfYear.getTime()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    return Math.ceil(diff / oneWeek)
  }

  const groupDaysByWeek = (dateRange: Date[]): WeekData[] => {
    const groupedData: WeekData[] = []
    dateRange.forEach((date) => {
      const weekNumber = getISOWeek(date)
      const existingWeek = groupedData.find(
        (group) => group.weekNumber === weekNumber,
      )

      if (existingWeek) {
        existingWeek.dates.push(date)
      } else {
        groupedData.push({ weekNumber, dates: [date] })
      }
    })
    return groupedData
  }

  const weeksData: WeekData[] = groupDaysByWeek(dateRange)

  const numRowsToFill = 30

  const fillEmptyRows = () => {
    const emptyRows = []
    for (let i = 0; i < numRowsToFill; i++) {
      emptyRows.push(
        <TableRow key={`empty-row-${i}`}>
          <TableCell
            sx={{
              padding: 0,
              height: "4rem",
              position: "sticky",
              left: 1,
              borderBottom: "1px solid black",
            }}
          >
            <Box
              sx={{
                height: "100%",
                borderRight: "1px solid black",
                bgcolor: "#FFFFFF",
              }}
            ></Box>
          </TableCell>
          {groupedData.map((day) =>
            day.groupedHours.map((hour) => (
              <TableCell
                key={`empty-cell-${i}-${day.date}-${hour}`}
                sx={{
                  borderRight: "1px solid #D9D9D9",
                  borderBottom: "1px solid black",
                }}
              ></TableCell>
            )),
          )}
        </TableRow>,
      )
    }
    return emptyRows
  }

  return (
    <TableContainer
      sx={{
        scrollbarWidth: "thin",
        scrollbarColor: "#333333 #EFEFEF",
        position: "relative",
        overflowX: "auto",
        "&::-webkit-scrollbar": {
          width: "100%",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#5A5A5A",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#D9D9D9",
          borderTop: "1px solid #000000",
        },
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              style={{
                position: "sticky",
                left: 0,
                top: 0,
                padding: 0,
                zIndex: 10,
                minWidth: "10rem",
                borderBottom: "none", // Remove bottom border for the header
                backgroundColor: "#D9D9D9",
              }}
            >
              <Box></Box>
            </TableCell>
            {weeksData.map((week) => (
              <TableCell
                colSpan={24 * 7}
                key={week.weekNumber}
                sx={{
                  minWidth: "10rem",
                  textAlign: "left",
                  padding: 0,
                  position: "sticky",
                  left: "10rem",
                  top: 0,
                  background: "#fff",
                  zIndex: 1,
                  borderBottom: "none", // Remove bottom border for the header
                  backgroundColor: "#D9D9D9",
                }}
              >
                <Stack
                  sx={{
                    paddingLeft: "8px",
                    borderBottom: "1px solid black",
                    borderLeft: "1px solid black",
                    minHeight: "1.5rem",
                    justifyContent: "center",
                  }}
                >
                  Week {week.weekNumber}
                </Stack>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell
              style={{
                padding: 0,
                position: "sticky",
                left: 0,
                top: "calc(1.5rem + 1px)", // Add 1px to account for the border
                background: "#fff",
                zIndex: 20,
                minWidth: "10rem",
                borderBottom: "none", // Remove bottom border for the header
                backgroundColor: "#D9D9D9",
              }}
            >
              <Box></Box>
            </TableCell>
            {groupedData.map((day, index) => (
              <React.Fragment key={index}>
                <TableCell
                  colSpan={24}
                  sx={{
                    textAlign: "left",
                    padding: 0,
                    position: "sticky",
                    left: "10rem",
                    top: "calc(1.5rem + 1px)",
                    background: "#fff",
                    zIndex: 1,
                    borderBottom: "none", // Remove bottom border for the header
                    backgroundColor: "#D9D9D9",
                  }}
                >
                  <Stack
                    sx={{
                      paddingLeft: "8px",
                      borderBottom: "1px solid black",
                      borderLeft: "1px solid black",
                      minHeight: "1.5rem",
                      justifyContent: "center",
                    }}
                  >
                    {day.date.toLocaleDateString()}
                  </Stack>
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>
          <TableRow>
            <TableCell
              style={{
                padding: 0,
                position: "sticky",
                left: 0,
                top: "calc(3rem + 2px)", // Add 1px to account for the border
                background: "#fff",
                zIndex: 20,
                minWidth: "10rem",
                borderBottom: "none", // Remove bottom border for the header
                backgroundColor: "#D9D9D9",
              }}
            >
              <Box
                sx={{
                  borderBottom: "1px solid black",
                  color: "transparent",
                  userSelect: "none",
                }}
              >
                \
              </Box>
            </TableCell>
            {groupedData.map((day) =>
              day.groupedHours.map((hour) => (
                <TableCell
                  key={`${day.date}-${hour}`}
                  sx={{
                    background: "#fff",
                    position: "sticky",
                    left: "10rem",
                    top: "calc(3rem + 2px)",
                    minWidth: "10rem",
                    textAlign: "left",
                    padding: 0,
                    zIndex: 1,
                    borderBottom: "none",
                    backgroundColor: "#D9D9D9",
                  }}
                >
                  <Stack
                    sx={{
                      paddingLeft: "8px",
                      borderBottom: "1px solid black",
                      borderLeft: "1px solid black",
                      minHeight: "1.5rem",
                      justifyContent: "center",
                    }}
                  >
                    {hour}:00
                  </Stack>
                </TableCell>
              )),
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {stands.map((stand) => (
            <TableRow key={stand.title}>
              <TableCell
                style={{
                  position: "sticky",
                  left: 1,
                  background: "#fff",
                  zIndex: 1,
                  padding: 0,
                  borderBottom: "1px solid black",
                }}
              >
                <Box
                  sx={{
                    borderRight: "1px solid black",
                    height: "100%",
                  }}
                >
                  <Stand stand={stand} />
                </Box>
              </TableCell>
              {groupedData.map((day) =>
                day.groupedHours.map((hour) => (
                  <TableCell
                    key={`${stand.title}-${day.date}-${hour}`}
                    sx={{
                      padding: 0,
                      borderRight: "1px solid #D9D9D9",
                      borderBottom: "1px solid black",
                    }}
                  >
                    {/* Your content for each cell */}
                  </TableCell>
                )),
              )}
            </TableRow>
          ))}
        </TableBody>
        {fillEmptyRows()}
      </Table>
    </TableContainer>
  )
}

export default ProductionSchedule
