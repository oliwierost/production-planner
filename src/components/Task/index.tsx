import EditIcon from "@mui/icons-material/Edit"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { Task as TaskType, deleteTaskStart } from "../../slices/tasks"
import { Stack, Typography } from "@mui/material"
import { ContextMenu } from "../ContextMenu"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"

interface TaskProps {
  task: TaskType
}

export function Task({ task }: TaskProps) {
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const [isGridUpdated, setIsGridUpdated] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })
  const view = useAppSelector((state) => state.view.view)
  const dispatch = useAppDispatch()
  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
    dispatch(setDragDisabled(false))
  }

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
        setModalOpen("updateTask")
        handleClose()
        dispatch(setDragDisabled(true))
      },
      icon: <EditIcon fontSize="small" sx={{ color: "black" }} />,
    },
    {
      title: "Usuń",
      onClick: () => {
        dispatch(deleteTaskStart({ taskId: task.id }))
      },
      icon: <DeleteForeverIcon fontSize="small" sx={{ color: "black" }} />,
    },
  ]
  return (
    <Stack
      width={120}
      height={60}
      border="1px solid #000000"
      justifyContent="center"
      px={3}
      borderRadius={1}
      sx={{ bgcolor: task.bgcolor, color: "#FFFFFF" }}
      onContextMenu={(e) => handleRightClick(e)}
    >
      <Typography variant="body1" fontWeight={700} noWrap>
        {task.title}
      </Typography>
      <ContextMenu
        open={open}
        onClose={handleClose}
        item={task}
        cursorPosition={cursorPosition}
        options={contextMenuOptions}
        isGridUpdated={isGridUpdated}
        setIsGridUpdated={setIsGridUpdated}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      />
    </Stack>
  )
}
