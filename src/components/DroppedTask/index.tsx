import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { Stack, Typography } from "@mui/material"
import { Task, deleteTaskStart, setTaskDroppedStart } from "../../slices/tasks"
import { ContextMenu } from "../ContextMenu"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import { setToastOpen } from "../../slices/toast"

interface DroppedTaskProps {
  task: Task
  left?: number
  width?: number
  rowId?: string | number
  colId?: number
}

export function DroppedTask({ task }: DroppedTaskProps) {
  const [taskRect, setTaskRect] = useState({ left: 0, top: 0, width: 0 })
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const [isGridUpdated, setIsGridUpdated] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })

  const dispatch = useAppDispatch()
  const view = useAppSelector((state) => state.view.view)
  const cellSpan = task.duration

  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (view?.name !== "1 mies.") return
    if (!anchorEl) {
      setCursorPosition({ left: event.clientX - 2, top: event.clientY - 4 })
      setAnchorEl(event.currentTarget)
      dispatch(setDragDisabled(true))
    }
  }
  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
    dispatch(setDragDisabled(false))
  }

  const contextMenuOptions = [
    {
      title: "Edytuj",
      onClick: () => {},
      icon: <EditIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Usuń z osi czasu",
      onClick: () => {},
      icon: <DeleteIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Usuń",
      onClick: () => {},
      icon: (
        <DeleteForeverIcon fontSize="small" sx={{ color: "primary.dark" }} />
      ),
    },
  ]

  return (
    <Stack height="50px">
      {task ? (
        <Stack
          onContextMenu={(e) => handleRightClick(e)}
          width={100}
          height="30px"
          justifyContent="center"
          sx={{
            zIndex: 20,
            boxSizing: "border-box",
            bgcolor: task.bgcolor,
            color: "background.default",
            transform: "translateY(10px)",
            borderRadius: 1,
            border: "1px solid black",
          }}
        >
          {task.title ? (
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{
                maxWidth: "100%",
                boxSizing: "border-box",
                textOverflow: "ellipsis",
                overflow: "hidden",
                px: "min(20px, 10%)",
              }}
            >
              {task.title}
            </Typography>
          ) : null}
          <ContextMenu
            options={contextMenuOptions}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            isGridUpdated={isGridUpdated}
            setIsGridUpdated={setIsGridUpdated}
            open={open}
            cursorPosition={cursorPosition}
            onClose={handleClose}
            item={task}
          />
        </Stack>
      ) : null}
    </Stack>
  )
}
