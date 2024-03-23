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
import { memo, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import { Active, ClientRect, DndContext, Over } from "@dnd-kit/core"
import { Draggable } from "../Draggable"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import type { Transform } from "@dnd-kit/utilities"
import { isEqual } from "lodash"
import { selectCell } from "../../selectors/grid"
import SplineLinkExample, { Arrow } from "../../Spline"
import SplineComponent from "../../Spline"
import Spline from "../../Spline"

interface Args {
  activatorEvent: Event | null
  active: Active | null
  activeNodeRect: ClientRect | null
  draggingNodeRect: ClientRect | null
  containerNodeRect: ClientRect | null
  over: Over | null
  overlayNodeRect: ClientRect | null
  scrollableAncestors: Element[]
  scrollableAncestorRects: ClientRect[]
  transform: Transform
  windowRect: ClientRect | null
}

interface DroppedTaskProps {
  task: Task
  cellWidth: number
  left?: number | undefined
  rowId: string | number
  colId: number
}

export const DroppedTask = memo(function DroppedTask({
  task,
  cellWidth,
  left = 0,
  rowId,
  colId,
}: DroppedTaskProps) {
  const projectId = useAppSelector(
    (state) => state.user.user?.openProjectId,
    isEqual,
  )
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
    isEqual,
  )

  const [modalOpen, setModalOpen] = useState<string | null>(null)
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
        setModalOpen("updateTask")
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

  function snapToGrid(args: Args) {
    const { transform } = args
    const gridSize = cellWidth
    const newTransform = {
      ...transform,
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    }
    const taskDurationNum = Number(task.duration)
    const daysDiff = newTransform.x / cellWidth
    const newDuration = daysDiff + taskDurationNum
    const nextCellState = nextCell?.state

    if (taskDuration < newDuration) {
      nextCellState == "occupied-start" ? null : setTaskDuration(newDuration)
    } else if (taskDuration > newDuration) {
      prevCell?.state == "occupied-start" ? null : setTaskDuration(newDuration)
    }
    return {
      ...transform,
      x: 0,
      y: 0,
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

  return (
    <>
      {task ? (
        <DndContext
          modifiers={[restrictToHorizontalAxis, snapToGrid]}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setIsDragging(false)}
        >
          <Stack
            onContextMenu={(e) => handleRightClick(e)}
            key={task.id}
            width={taskDuration * cellWidth}
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
              onClose={() => {
                handleClose()
                dispatch(setDragDisabled(false))
              }}
              item={task}
            />

            <Box
              sx={{
                position: "relative",
                minWidth: "10px",
                height: "22px",
                mr: 1,
                cursor: "col-resize",
              }}
            >
              <Draggable
                id={task.id + "handle"}
                data={{
                  task: task,
                  sourceId: null,
                }}
              >
                <Box
                  minWidth={10}
                  height="22px"
                  sx={{
                    borderRadius: "0 4px 4px 0",
                    backgroundImage: `repeating-linear-gradient(45deg, ${
                      task.projectId === projectId ? task.bgcolor : "grey.400"
                    }, ${
                      task.projectId === projectId ? task.bgcolor : "grey.400"
                    } 2px, #000000 4px, #000000 2px)`,
                    backgroundSize: "22px 22px",
                    border: "1px solid black",
                    boxSizing: "border-box",
                    cursor: "col-resize",
                    display:
                      (isHovered || isDragging) &&
                      task.projectId === projectId &&
                      !task.dragged
                        ? "block"
                        : "none",
                  }}
                />
              </Draggable>
            </Box>
          </Stack>
        </DndContext>
      ) : null}
    </>
  )
})
