import EditIcon from "@mui/icons-material/Edit"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { Task as TaskType, deleteTaskStart } from "../../slices/tasks"
import { Stack, Typography } from "@mui/material"
import { ContextMenu } from "../ContextMenu"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import { Modal } from "../DataPanel"

interface TaskProps {
  task: TaskType
}

export function Task({ task }: TaskProps) {
  const [modal, setModal] = useState<Modal | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })
  const view = useAppSelector((state) => state.view.view)
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
  )
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)

  const dispatch = useAppDispatch()
  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
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
        if (!workspaceId || !projectId) return
        setModal({
          open: true,
          item: "task",
          workspaceId: workspaceId,
          projectId: projectId,
        })
        dispatch(setDragDisabled(true))
        handleClose()
      },
      icon: <EditIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Usuń",
      onClick: () => {
        dispatch(deleteTaskStart({ task }))
        dispatch(setDragDisabled(false))
        handleClose()
      },
      icon: (
        <DeleteForeverIcon fontSize="small" sx={{ color: "primary.dark" }} />
      ),
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
      position="relative"
    >
      <Typography variant="body1" fontWeight={700} noWrap>
        {task.title}
      </Typography>
      <Stack
        direction="row"
        position="absolute"
        top={1}
        right={2}
        spacing={0.3}
        alignItems="center"
      >
        <Typography fontSize="12px" color="white" fontWeight={600}>
          {task.duration}
        </Typography>
        <AccessTimeIcon sx={{ color: "white", fontSize: "15px" }} />
      </Stack>
      <ContextMenu
        open={open}
        onClose={handleClose}
        item={task}
        cursorPosition={cursorPosition}
        options={contextMenuOptions}
        modal={modal}
        setModal={setModal}
      />
    </Stack>
  )
}
