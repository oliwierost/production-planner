import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useAppSelector } from "../../hooks"

interface DeadlineProps {
  time: number
  rowIndex: number | undefined
  lastIndex: number
}

export function CurrentDay({ time, rowIndex, lastIndex }: DeadlineProps) {
  const viewState = useAppSelector((state) => state.view)

  const todayTimestamp = new Date().setHours(0, 0, 0, 0)
  const [timestamp, setTimestamp] = useState(todayTimestamp)
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (!viewState.view) return

    if (viewState.view.name == "1 mies.") {
      setTimestamp(todayTimestamp)
      setLeft(0)
    } else if (viewState.view.name == "3 mies.") {
      const quarterDate = new Date(2024, 1, 1, 0, 0)
      while (
        todayTimestamp >=
        quarterDate.getTime() + 7 * 24 * 60 * 60 * 1000
      ) {
        quarterDate.setDate(quarterDate.getDate() + 7)
      }
      const weekTimestamp = quarterDate.getTime()
      setTimestamp(weekTimestamp)
      setLeft(
        (viewState.view.cellWidth! / 7) *
          Math.floor((todayTimestamp - weekTimestamp) / (1000 * 60 * 60 * 24)),
      )
    } else if (viewState.view.name == "1 rok") {
      const yearDate = new Date(2024, 1, 1, 0, 0)
      while (todayTimestamp >= yearDate.getTime() + 30 * 24 * 60 * 60 * 1000) {
        yearDate.setMonth(yearDate.getMonth() + 1)
      }
      const monthTimestamp = yearDate.getTime()
      setTimestamp(monthTimestamp)
      setLeft(
        (viewState.view.cellWidth! / 30) *
          Math.floor((todayTimestamp - monthTimestamp) / (1000 * 60 * 60 * 24)),
      )
    }
  }, [viewState.view?.name])

  if (viewState.view && timestamp === time) {
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
              bgcolor: "#0096FF",
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
                borderColor: "transparent transparent #0096FF transparent",
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
                  borderColor: "transparent transparent #0096FF transparent",
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
                Dziś
              </Typography>
            </>
          ) : null}
        </Box>
      </Box>
    )
  }
}
