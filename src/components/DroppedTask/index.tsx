import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { Stack, Typography } from "@mui/material"
import { Task, deleteTaskStart, setTaskDroppedStart } from "../../slices/tasks"
import { ContextMenu } from "../ContextMenu"
import { useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled, setRect } from "../../slices/drag"
import { setToastOpen } from "../../slices/toast"

interface DroppedTaskProps {
  task: Task
  taskRect: { left: number; top: number; width: number }
}

export function DroppedTask({ task, taskRect }: DroppedTaskProps) {
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const [isGridUpdated, setIsGridUpdated] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })
  const draggedTaskId = useAppSelector((state) => state.drag.draggedTaskId)
  const taskRef = useRef<HTMLDivElement>(null)

  const dispatch = useAppDispatch()
  const view = useAppSelector((state) => state.view.view)

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

  useEffect(() => {
    if (taskRef.current && task.id === draggedTaskId) {
      const taskRect = taskRef.current.getBoundingClientRect()
      dispatch(
        setRect({
          top: taskRect.top,
          left: taskRect.left,
          width: taskRect.width,
          height: taskRect.height,
        }),
      )
    }
  }, [draggedTaskId, task.id, dispatch])

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
    <Stack
      height="50px"
      position="static"
      ref={taskRef}
      justifyContent="center"
    >
      {task ? (
        <Stack
          onContextMenu={(e) => handleRightClick(e)}
          width={taskRect.width}
          height="30px"
          justifyContent="center"
          sx={{
            zIndex: 3,
            boxSizing: "border-box",
            bgcolor: task.bgcolor,
            color: "background.default",
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
