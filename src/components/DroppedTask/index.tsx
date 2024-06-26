import DeleteIcon from "@mui/icons-material/Delete"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import EditIcon from "@mui/icons-material/Edit"
import { Box, IconButton, Stack, Typography } from "@mui/material"
import { isEqual } from "lodash"
import React, { memo, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { selectCell } from "../../selectors/grid"
import { selectTask, selectTasksByIds } from "../../selectors/tasks"
import { setDragDisabled } from "../../slices/drag"
import {
  Task,
  deleteTaskStart,
  resizeTaskStart,
  setTaskDroppedStart,
  setTaskLockedStart,
} from "../../slices/tasks"
import { ContextMenu } from "../ContextMenu"

import { selectFacility } from "../../selectors/facilities"
import { Arrows } from "../Arrows"
import { calculateTaskWidthHelper } from "../DataGrid/calculateTaskWidthHelper"
import { Modal } from "../DataPanel"

import { calculateTaskLeftOffsetHelper } from "../DataGrid/calculateTaskLeftOffsetHelper"

import { Lock, LockOpen } from "@mui/icons-material"
import { selectInvite } from "../../selectors/invites"
import { selectProject } from "../../selectors/projects"

import α from "color-alpha"
import { selectWorkspace } from "../../selectors/workspaces"
import { TaskTooltip } from "../TaskTooltip"
interface DroppedTaskProps {
  isResized: boolean
  setIsResized: React.Dispatch<React.SetStateAction<boolean>>
  task: Task
  cellWidth: number
  rowId: string | number
  colId: number
  isOverlay?: boolean
  delta: number
  setDelta: React.Dispatch<React.SetStateAction<number>>
}

export const DroppedTask = memo(function DroppedTask({
  isResized,
  setIsResized,
  task,
  cellWidth,
  rowId,
  colId,
  isOverlay = false,
  delta = 0,
  setDelta,
}: DroppedTaskProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const projectId = useAppSelector(
    (state) => state.user.user?.openProjectId,
    isEqual,
  )
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
    isEqual,
  )

  const workspace = useAppSelector((state) =>
    selectWorkspace(state, workspaceId),
  )

  const project = useAppSelector((state) =>
    selectProject(state, workspaceId, projectId),
  )

  const invite = useAppSelector((state) =>
    selectInvite(state, project?.inviteId),
  )
  const overFacilityId = useAppSelector(
    (state) => state.drag.overFacilityId,
    isEqual,
  )

  const overFacility = useAppSelector(
    (state) => selectFacility(state, workspaceId, overFacilityId),
    isEqual,
  )

  const currentFacility = useAppSelector(
    (state) => selectFacility(state, workspaceId, task.facilityId),
    isEqual,
  )
  const droppedTask = useAppSelector(
    (state) => selectTask(state, task.id, projectId),
    isEqual,
  )

  const draggedTask = useAppSelector((state) => state.drag.draggedTask)

  const requiredTasksIds = droppedTask!?.requiredTasks
  const requiredTasks = useAppSelector((state) =>
    selectTasksByIds(state, projectId, requiredTasksIds),
  )

  const [modal, setModal] = useState<Modal | null>(null)
  const [taskDuration, setTaskDuration] = useState<number>(
    Number(task?.duration),
  )

  const [isHovered, setIsHovered] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })
  const dispatch = useAppDispatch()
  const view = useAppSelector((state) => state.view.view, isEqual)

  const nextCellKey = `${rowId}-${
    colId + (taskDuration * 86400000) / currentFacility!.manpower
  }`
  const prevCellKey = `${rowId}-${
    colId + ((taskDuration - 1) * 86400000) / currentFacility!.manpower
  }`

  const nextCell = useAppSelector(
    (state) => selectCell(state, workspaceId, nextCellKey),
    isEqual,
  )
  const prevCell = useAppSelector(
    (state) => selectCell(state, workspaceId, prevCellKey),
    isEqual,
  )
  const drag = useAppSelector((state) => state.drag, isEqual)

  const cellSpan = task.duration
  const progressTimestamp =
    task.startTime! +
    86400000 * (cellSpan / currentFacility?.manpower!) * (task.progress / 100)
  const currentDay = new Date().setHours(0, 0, 0, 0)

  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (
      view?.name !== "1 mies." ||
      projectId !== task.projectId ||
      (invite && invite?.permissions !== "edycja" ? true : false)
    )
      return
    if (!anchorEl) {
      setTooltipOpen(false)
      setCursorPosition({ left: event.clientX - 2, top: event.clientY - 4 })
      setAnchorEl(event.currentTarget)
      dispatch(setDragDisabled(true))
    }
  }
  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
  }

  const contextMenuOptions = [
    {
      title: "Edytuj",
      onClick: () => {
        if (!projectId || !workspaceId) return
        setModal({
          open: true,
          item: "task",
          projectId: projectId,
          workspaceId: workspaceId,
        })
        dispatch(setDragDisabled(true))
        setTooltipOpen(false)
        handleClose()
      },
      icon: <EditIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Zdaj raport",
      onClick: () => {
        if (!projectId || !workspaceId) return
        setModal({
          open: true,
          item: "raport",
          projectId: projectId,
          workspaceId: workspaceId,
          taskId: task.id,
        })
        dispatch(setDragDisabled(false))
        setTooltipOpen(false)
        handleClose()
      },
      icon: <DeleteIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Usuń z osi czasu",
      onClick: () => {
        dispatch(
          setTaskDroppedStart({
            task: task,
            dropped: false,
            rowId: rowId as string,
            colId,
          }),
        )
        dispatch(setDragDisabled(false))
        setTooltipOpen(false)
        handleClose()
      },
      icon: <DeleteIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Usuń",
      onClick: () => {
        dispatch(
          deleteTaskStart({
            task: task,
            facilityId: rowId as string,
            colId,
            cellSpan,
          }),
        )
        dispatch(setDragDisabled(false))
        setTooltipOpen(false)
        handleClose()
      },
      icon: (
        <DeleteForeverIcon fontSize="small" sx={{ color: "primary.dark" }} />
      ),
    },
  ]

  const handleDragMove = (event: MouseEvent) => {
    const deltaX = event.movementX
    setDelta((prev) => {
      return prev + deltaX
    })
    setTooltipOpen(false)
  }

  useEffect(() => {
    if (delta === 0) return

    const gridSize = cellWidth
    const newX = Math.round(delta / gridSize) * gridSize
    const taskDurationNum = Number(task.duration)
    const daysDiff =
      Math.round(newX / cellWidth / 2) * currentFacility!.manpower
    const newDuration = Number(daysDiff) + taskDurationNum

    const newDurationRounded =
      Math.round(newDuration / currentFacility!.manpower) *
      currentFacility!.manpower

    if (newDurationRounded <= currentFacility!.manpower) {
      setTaskDuration(currentFacility!.manpower)
    } else if (taskDuration < newDurationRounded) {
      nextCell?.state == "occupied-start"
        ? null
        : setTaskDuration(newDurationRounded)
    } else if (taskDuration > newDurationRounded) {
      prevCell?.state == "occupied-start"
        ? null
        : setTaskDuration(newDurationRounded)
    }
  }, [delta])

  const handleDragEnd = () => {
    setIsResized(false)
    if (isHovered) {
      setTooltipOpen(true)
    }
    dispatch(
      resizeTaskStart({
        task: task,
        cellId: `${rowId}-${colId}`,
        newDuration: taskDuration,
      }),
    )
  }

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    setDelta(0)
    setIsResized(true)
  }

  const handleDragCancel = () => {
    setIsResized(false)
  }

  const getTaskWidth = () => {
    if (!view) return 0
    if (
      drag.draggedTask &&
      drag.draggedTask.id == task.id &&
      overFacility &&
      !isOverlay
    ) {
      return calculateTaskWidthHelper({
        duration: isOverlay ? task.duration : taskDuration,
        cellWidth: cellWidth,
        manpower: overFacility!.manpower,
        daysInCell: view?.daysInCell,
      })
    } else {
      return calculateTaskWidthHelper({
        duration: isOverlay ? task.duration : taskDuration,
        cellWidth: cellWidth,
        manpower: currentFacility!.manpower,
        daysInCell: view?.daysInCell,
      })
    }
  }

  const getLeftOffset = () => {
    return calculateTaskLeftOffsetHelper(
      task.startTime!,
      colId,
      cellWidth,
      view?.daysInCell!,
    )
  }

  const [taskWidth, setTaskWidth] = useState(0)
  const [leftOffset, setTaskLeftOffset] = useState(getLeftOffset())

  useEffect(() => {
    setTaskDuration(task.duration)
  }, [task.duration])

  useEffect(() => {
    const width = getTaskWidth()
    setTaskWidth(width)
  }, [
    currentFacility,
    overFacility,
    drag.draggedTask,
    taskDuration,
    view?.name,
    isResized,
  ])

  useEffect(() => {
    setTaskLeftOffset(getLeftOffset())
  }, [task.startTime, colId, cellWidth, view?.daysInCell])

  const handleLock = () => {
    dispatch(
      setTaskLockedStart({
        task: task,
        locked: !task.locked,
      }),
    )
  }

  //add mouse move event listener to resize task
  useEffect(() => {
    if (isResized) {
      document.addEventListener("mousemove", handleDragMove)
      document.addEventListener("mouseup", handleDragEnd)
      document.addEventListener("mouseleave", handleDragCancel)
    } else {
      document.removeEventListener("mousemove", handleDragMove)
      document.removeEventListener("mouseup", handleDragEnd)
      document.removeEventListener("mouseleave", handleDragCancel)
    }

    return () => {
      document.removeEventListener("mousemove", handleDragMove)
      document.removeEventListener("mouseup", handleDragEnd)
      document.removeEventListener("mouseleave", handleDragCancel)
    }
  }, [isResized, taskDuration, task.duration])

  if (!projectId) return null

  return (
    <>
      {task ? (
        <>
          {requiredTasks &&
          isOverlay &&
          taskWidth &&
          workspace?.displayArrows ? (
            <Arrows
              task={task}
              requiredTasks={requiredTasks}
              taskWidth={taskWidth}
              overFacility={overFacility}
              colId={colId}
            />
          ) : null}
          <TaskTooltip task={task} open={tooltipOpen}>
            <Stack
              onContextMenu={(e) => handleRightClick(e)}
              key={task.id}
              width={taskWidth}
              height="30px"
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onMouseEnter={() => {
                setIsHovered(true)
                if (!modal?.open || isResized) setTooltipOpen(true)
              }}
              onMouseLeave={() => {
                setIsHovered(false)
                setTooltipOpen(false)
              }}
              sx={{
                background:
                  task.projectId === projectId
                    ? `linear-gradient(90deg, ${task.bgcolor} ${
                        task.progress
                      }%, ${α(task.bgcolor, 0.6)} ${task.progress}%)`
                    : "#D9D9D9",
                color: "background.default",
                borderRadius: 1,
                border:
                  progressTimestamp < currentDay ? "2px solid #C70039" : "none",
                boxSizing: "border-box",
                display:
                  !isOverlay || draggedTask?.id === task.id || isResized
                    ? "flex"
                    : "none",
                opacity: isOverlay ? 0.5 : 1,
                zIndex: isOverlay ? 10 : 30,
                transform: `translateX(${leftOffset}px)`,
              }}
            >
              {task.title && view?.name !== "1 rok" && taskWidth > cellWidth ? (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton
                    sx={{
                      color: "white",

                      "&:focus": {
                        outline: "none",
                      },
                    }}
                    onClick={handleLock}
                  >
                    {task.locked ? (
                      <Lock fontSize="small" />
                    ) : (
                      <LockOpen fontSize="small" />
                    )}
                  </IconButton>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    noWrap
                    sx={{
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {task.title}
                  </Typography>
                </Stack>
              ) : null}
              <ContextMenu
                options={contextMenuOptions}
                modal={modal}
                setModal={setModal}
                open={open}
                cursorPosition={cursorPosition}
                onClose={() => {
                  handleClose()
                }}
                item={task}
              />
              {view?.name == "1 mies." &&
              task.projectId === projectId &&
              (!invite || invite?.permissions == "edycja") ? (
                <Stack direction="row" mr={2} height="100%" alignItems="center">
                  <Box
                    sx={{
                      position: "absolute",
                      right: "-10px",
                      top: "-50%",
                      transform: "translateY(50%)",
                      minWidth: "10px",
                      height: "30px",
                    }}
                    onMouseDown={(e) => handleDragStart(e)}
                  >
                    <Box
                      minWidth={30}
                      height="30px"
                      sx={{
                        cursor: "col-resize",
                        display:
                          isHovered &&
                          !isResized &&
                          task.projectId === projectId &&
                          draggedTask?.id !== task.id &&
                          !task.locked
                            ? "block"
                            : "none",
                      }}
                    />
                  </Box>
                </Stack>
              ) : null}
            </Stack>
          </TaskTooltip>
        </>
      ) : null}
    </>
  )
})
