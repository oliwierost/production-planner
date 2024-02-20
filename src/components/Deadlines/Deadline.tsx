import EditIcon from "@mui/icons-material/Edit"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { useEffect, useState } from "react"
import {
  Deadline as DeadlineType,
  removeDeadlineStart,
} from "../../slices/deadlines"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import { Box, Typography } from "@mui/material"
import { ContextMenu } from "../ContextMenu"

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
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const [isGridUpdated, setIsGridUpdated] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })

  const dispatch = useAppDispatch()
  const view = useAppSelector((state) => state.view.view)
  const cellWidth = view?.cellWidth
  const { day, week, month } = deadline.timestamp
  const open = Boolean(anchorEl)

  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (view?.name !== "1 mies.") return
    if (!anchorEl) {
      setCursorPosition({ left: event.clientX - 2, top: event.clientY - 4 })
      setAnchorEl(event.currentTarget)
      dispatch(setDragDisabled(true))
    }
  }

  const contextMenuOptions = [
    {
      title: "Edytuj",
      onClick: () => {
        setModalOpen("updateDeadline")
        handleClose()
        dispatch(setDragDisabled(true))
      },
      icon: <EditIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Usuń",
      onClick: () => {
        dispatch(removeDeadlineStart(deadline.id))
        setIsGridUpdated(true)
        handleClose()
      },
      icon: (
        <DeleteForeverIcon fontSize="small" sx={{ color: "primary.dark" }} />
      ),
    },
  ]

  const handleClose = () => {
    setAnchorEl(null)
    dispatch(setDragDisabled(false))
  }

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
      <Box
        position="absolute"
        left={left}
        onContextMenu={(e) => handleRightClick(e)}
      >
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
        <ContextMenu
          open={open}
          onClose={handleClose}
          item={deadline}
          cursorPosition={cursorPosition}
          options={contextMenuOptions}
          isGridUpdated={isGridUpdated}
          setIsGridUpdated={setIsGridUpdated}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
        />
      </Box>
    )
  }
}
