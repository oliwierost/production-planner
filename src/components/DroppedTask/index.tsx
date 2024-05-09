import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { IconButton, Stack, Typography } from "@mui/material"
import {
  Task,
  deleteTaskStart,
  resizeTaskStart,
  setTaskDroppedStart,
  setTaskLockedStart,
} from "../../slices/tasks"
import { ContextMenu } from "../ContextMenu"
import React, { memo, useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import {
  DndContext,
  DragMoveEvent,
  MouseSensor,
  useSensor,
} from "@dnd-kit/core"

import { isEqual } from "lodash"
import { selectCell } from "../../selectors/grid"
import { selectTask, selectTasksByIds } from "../../selectors/tasks"

import { Arrows } from "../Arrows"
import { Modal } from "../DataPanel"
import { selectFacility } from "../../selectors/facilities"
import { calculateTaskWidthHelper } from "../DataGrid/calculateTaskWidthHelper"

import { ResizeHandle } from "../ResizeHandle"
import { calculateTaskLeftOffsetHelper } from "../DataGrid/calculateTaskLeftOffsetHelper"

import { Lock, LockOpen } from "@mui/icons-material"
import { selectProject } from "../../selectors/projects"
import { selectInvite } from "../../selectors/invites"

import α from "color-alpha"
import { selectWorkspace } from "../../selectors/workspaces"
interface DroppedTaskProps {
  isResized: boolean
  setIsResized: React.Dispatch<React.SetStateAction<boolean>>
  task: Task
  cellWidth: number
  rowId: string | number
  colId: number
  isOverlay?: boolean
}

export const DroppedTask = memo(function DroppedTask({
  isResized,
  setIsResized,
  task,
  cellWidth,
  rowId,
  colId,
  isOverlay = false,
}: DroppedTaskProps) {
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
        handleClose()
      },
      icon: <EditIcon fontSize="small" sx={{ color: "primary.dark" }} />,
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
        handleClose()
      },
      icon: (
        <DeleteForeverIcon fontSize="small" sx={{ color: "primary.dark" }} />
      ),
    },
  ]

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args) // Call func with spread args directly
      }, delay)
    }
  }

  const handleDragMove = useCallback(
    debounce((event: DragMoveEvent) => {
      const { delta } = event

      const gridSize = cellWidth
      const newX = Math.round(delta.x / gridSize) * gridSize
      const taskDurationNum = Number(task.duration)
      const daysDiff = (newX / cellWidth) * currentFacility!.manpower
      const newDuration = daysDiff + taskDurationNum

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
    }, 5),
    [
      cellWidth,
      currentFacility,
      nextCell,
      prevCell,
      setTaskDuration,
      task.duration,
      taskDuration,
    ],
  )

  const handleDragEnd = () => {
    setIsResized(false)
    dispatch(
      resizeTaskStart({
        task: task,
        cellId: `${rowId}-${colId}`,
        newDuration: taskDuration,
      }),
    )
  }

  const handleDragStart = () => {
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
        duration: taskDuration,
        cellWidth: cellWidth,
        manpower: overFacility!.manpower,
        daysInCell: view?.daysInCell,
      })
    } else {
      return calculateTaskWidthHelper({
        duration: taskDuration,
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

  const [taskWidth, setTaskWidth] = useState(getTaskWidth())
  const [leftOffset, setTaskLeftOffset] = useState(getLeftOffset())

  useEffect(() => {
    setTaskWidth(getTaskWidth())
  }, [
    currentFacility,
    overFacility,
    drag.draggedTask,
    taskDuration,
    view?.name,
  ])

  useEffect(() => {
    setTaskLeftOffset(getLeftOffset())
  }, [task.startTime, colId, cellWidth, view?.daysInCell])

  useEffect(() => {
    setTaskDuration(task.duration)
  }, [task.duration])

  const handleLock = () => {
    dispatch(
      setTaskLockedStart({
        task: task,
        locked: !task.locked,
      }),
    )
  }
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  })

  if (!projectId) return null

  return (
    <>
      {task ? (
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          onDragMove={handleDragMove}
          sensors={[mouseSensor]}
        >
          {requiredTasks &&
          isOverlay &&
          taskWidth &&
          view?.name == "1 mies." &&
          workspace?.displayArrows ? (
            <Arrows
              task={task}
              requiredTasks={requiredTasks}
              taskWidth={taskWidth}
              overFacility={overFacility}
            />
          ) : null}
          <Stack
            onContextMenu={(e) => handleRightClick(e)}
            key={task.id}
            width={taskWidth}
            height="30px"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              transition: "width 0.1s ease", // Apply transition inline
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
            {task.title &&
            view?.name !== "1 rok" &&
            Number(task.duration) > currentFacility!.manpower ? (
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
              <Stack
                direction="row"
                mr={1}
                height="100%"
                alignItems="center"
                justifySelf="flex-end"
              >
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
                <ResizeHandle
                  task={task}
                  isResized={isResized}
                  isHovered={isHovered}
                  projectId={projectId}
                />
              </Stack>
            ) : null}
          </Stack>
        </DndContext>
      ) : null}
    </>
  )
})
