import { useEffect, useState } from "react"
import { Deadline as DeadlineType } from "../../slices/deadlines"
import { useAppSelector } from "../../hooks"
import { Box, Typography } from "@mui/material"

interface DeadlineProps {
  time: number
  rowIndex: number | undefined
  lastIndex: number
  deadline: DeadlineType
}

export function Deadline({
  time,
  rowIndex,
  lastIndex,
  deadline,
}: DeadlineProps) {
  const [timestamp, setTimestamp] = useState<number | null>(null)
  const [left, setLeft] = useState<number>(0)
  const view = useAppSelector((state) => state.view.view)
  const cellWidth = view?.cellWidth
  const { day, week, month } = deadline.timestamp

  useEffect(() => {
    if (!view) return
    if (view.name == "1 mies.") {
      setTimestamp(day)
      setLeft(0)
    } else if (view.name == "3 mies.") {
      setTimestamp(week)
      const daysDiff = Math.floor((day - week) / (1000 * 60 * 60 * 24))
      setLeft((cellWidth! / 7) * daysDiff)
    } else if (view.name == "1 rok") {
      setTimestamp(month)
      const daysDiff = Math.floor((day - month) / (1000 * 60 * 60 * 24))
      setLeft((cellWidth! / 30) * daysDiff)
    }
  }, [view])

  if (timestamp === time) {
    return (
      <Box position="absolute" left={left}>
        <Box width="fit-content" height="50px">
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: "2px",
              bgcolor: "red",
              transform: "translate(-50%,0%)",
              zIndex: 999,
            }}
          />
          {rowIndex === 0 ? (
            <Box
              sx={{
                position: "absolute",
                top: -1,
                left: -7,
                width: "0px",
                height: "0px",
                borderStyle: "solid",
                borderWidth: "0 7px 10px 7px",
                borderColor: "transparent transparent red transparent",
                transform: "rotate(180deg)",
                zIndex: 999,
              }}
            />
          ) : null}
          {rowIndex === lastIndex ? (
            <>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: -7,
                  width: "0px",
                  height: "0px",
                  borderStyle: "solid",
                  borderWidth: "0 7px 10px 7px",
                  borderColor: "transparent transparent red transparent",
                }}
              />

              <Typography
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  transform: "translate(-50%,0%)",
                  textAlign: "center",
                }}
                variant="body2"
              >
                {deadline.title}
              </Typography>
            </>
          ) : null}
        </Box>
      </Box>
    )
  }
}
