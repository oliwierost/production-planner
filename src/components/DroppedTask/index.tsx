import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { Box, Stack, Typography } from "@mui/material"
import {
  Task,
  deleteTaskStart,
  resizeTaskStart,
  setTaskDroppedStart,
} from "../../slices/tasks"
import { ContextMenu } from "../ContextMenu"
import { memo, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import { DndContext, DragMoveEvent } from "@dnd-kit/core"
import { Draggable } from "../Draggable"

import { isEqual } from "lodash"
import { selectCell } from "../../selectors/grid"
import { selectTask, selectTasksByIds } from "../../selectors/tasks"

import { Arrows } from "../Arrows"
import { Modal } from "../DataPanel"
import { selectFacility } from "../../selectors/facilities"
import { calculateTaskWidthHelper } from "../DataGrid/calculateTaskWidthHelper"
import {
  createSnapModifier,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers"
import { ResizeHandle } from "../ResizeHandle"

interface DroppedTaskProps {
  task: Task
  cellWidth: number
  left?: number | undefined
  rowId: string | number
  colId: number
  isOverlay: boolean
}

export const DroppedTask = memo(function DroppedTask({
  task,
  cellWidth,
  left = 0,
  rowId,
  colId,
  isOverlay,
}: DroppedTaskProps) {
  const [isResized, setIsResized] = useState(false)
  const projectId = useAppSelector(
    (state) => state.user.user?.openProjectId,
    isEqual,
  )
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
    isEqual,
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
  const requiredTasksIds = droppedTask!.requiredTasks

  const requiredTasks = useAppSelector((state) =>
    selectTasksByIds(state, projectId, requiredTasksIds),
  )
  const [modal, setModal] = useState<Modal | null>(null)
  const [taskDuration, setTaskDuration] = useState<number>(task?.duration)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isGridUpdated, setIsGridUpdated] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })
  const dispatch = useAppDispatch()
  const view = useAppSelector((state) => state.view.view, isEqual)
  const nextCellKey = `${rowId}-${colId + taskDuration * 86400000}`
  const prevCellKey = `${rowId}-${colId + (taskDuration - 1) * 86400000}`

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
        setIsGridUpdated(true)
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
        setIsGridUpdated(true)
        dispatch(setDragDisabled(false))
        handleClose()
      },
      icon: (
        <DeleteForeverIcon fontSize="small" sx={{ color: "primary.dark" }} />
      ),
    },
  ]

  const handleDragMove = (event: DragMoveEvent) => {
    const { delta } = event
    const gridSize = cellWidth
    const newX = Math.round(delta.x / gridSize) * gridSize
    const taskDurationNum = Number(task.duration)
    const daysDiff = (newX / cellWidth) * currentFacility!.manpower
    const newDuration = daysDiff + taskDurationNum
    const nextCellState = nextCell?.state

    if (taskDuration < newDuration) {
      nextCellState == "occupied-start" ? null : setTaskDuration(newDuration)
    } else if (taskDuration > newDuration) {
      prevCell?.state == "occupied-start" ? null : setTaskDuration(newDuration)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    dispatch(
      resizeTaskStart({
        task: task,
        cellId: `${rowId}-${colId}`,
        newDuration: taskDuration,
      }),
    )
    setIsGridUpdated(true)
  }

  const getTaskWidth = () => {
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
      })
    } else {
      return calculateTaskWidthHelper({
        duration: taskDuration,
        cellWidth: cellWidth,
        manpower: currentFacility!.manpower,
      })
    }
  }
  const [taskWidth, setTaskWidth] = useState(getTaskWidth())

  useEffect(() => {
    setTaskWidth(getTaskWidth())
  }, [currentFacility, overFacility, drag.draggedTask, taskDuration])

  if (!projectId) return null

  return (
    <>
      {task ? (
        <DndContext
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setIsDragging(false)}
          onDragMove={handleDragMove}
        >
          {requiredTasks && isOverlay && taskWidth ? (
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
            left={left}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
              bgcolor: task.projectId === projectId ? task.bgcolor : "grey.400",
              color: "background.default",
              borderRadius: 1,
              border: "1px solid black",
              boxSizing: "border-box",
              display: !isOverlay
                ? "flex"
                : draggedTask?.id !== task.id
                ? "none"
                : "flex",
              opacity: isOverlay ? 0.5 : 1,
              zIndex: isOverlay ? 20 : 1,
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
              modal={modal}
              setModal={setModal}
              isGridUpdated={isGridUpdated}
              setIsGridUpdated={setIsGridUpdated}
              open={open}
              cursorPosition={cursorPosition}
              onClose={() => {
                handleClose()
              }}
              item={task}
            />

            <ResizeHandle
              task={task}
              isDragging={isDragging}
              isHovered={isHovered}
              projectId={projectId}
            />
          </Stack>
        </DndContext>
      ) : null}
    </>
  )
})
