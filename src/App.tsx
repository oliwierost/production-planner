import { Alert, Box, Snackbar, Stack } from "@mui/material"
import { TaskSlider } from "./components/TaskSlider"
import {
  Active,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Over,
  useSensor,
  useSensors,
  MouseSensor,
} from "@dnd-kit/core"
import { Toolbar } from "./components/Toolbar"
import { useEffect, useRef, useState } from "react"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { DataGrid } from "./components/DataGrid"
import { ThemeProvider } from "@mui/material/styles"
import { theme } from "../theme"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { generateMonthView } from "./generateView"

import {
  initializeGridStart,
  syncGridStart,
  updateGridStart,
} from "./slices/grid"

import {
  Task,
  moveTaskStart,
  setTaskDroppedStart,
  syncTasksStart,
} from "./slices/tasks"
import { useAppDispatch, useAppSelector } from "./hooks"
import { syncFacilitiesStart } from "./slices/facilities"
import { setToastClose, setToastOpen } from "./slices/toast"
import { setMonthView } from "./slices/view"
import { TimelineToolbar } from "./components/TimelineToolbar"
import { syncDeadlinesStart } from "./slices/deadlines"
import { Timeline } from "./components/Timeline"

export interface DraggedTask {
  draggableId: string | null
  task: Task | null
}

function App() {
  const [isGridUpdated, setIsGridUpdated] = useState(false)
  const [draggedTask, setDraggedTask] = useState<DraggedTask>({
    draggableId: null,
    task: null,
  })
  const dispatch = useAppDispatch()
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(syncTasksStart())
    dispatch(syncFacilitiesStart())
    dispatch(syncGridStart())
    dispatch(syncDeadlinesStart())
    dispatch(initializeGridStart())
  }, [dispatch])

  const toastState = useAppSelector((state) => state.toast)
  const gridState = useAppSelector((state) => state.grid)
  const cellStateMap = gridState.grid

  useEffect(() => {
    if (cellStateMap) {
      dispatch(
        setMonthView({ view: generateMonthView(1000), grid: cellStateMap }),
      )
    }
  }, [dispatch, cellStateMap])

  useEffect(() => {
    if (isGridUpdated && gridState.grid) {
      dispatch(updateGridStart(gridState.grid))
      setIsGridUpdated(false)
    }
  }, [isGridUpdated, dispatch, gridState.grid])

  const checkCanDrop = (over: Over, active: Active) => {
    const overId = over.id
    const task = active.data.current?.task
    const cellSpan = task.duration

    const [rowId, colId] = (overId as string).split("-")
    if (!cellStateMap) return
    const increment = 1000 * 60 * 60 * 24
    for (let i = 0; i < cellSpan * increment; i += increment) {
      const cellId = `${rowId}-${Number(colId) + i}`
      if (cellId in cellStateMap.cells) {
        const cell = cellStateMap.cells[cellId]
        if (Object.keys(cell.tasks).some((tid) => tid !== task.id)) {
          dispatch(
            setToastOpen({
              message: "Wykryto kolizję",
              severity: "error",
            }),
          )
          return false
        }
      }
    }

    return true
  }

  const handleDragEndFromSlider = (over: Over, active: Active) => {
    const cellId = over?.id as string
    const task = active.data.current?.task
    const cellSpan = task.duration
    const [rowId, colId] = cellId.split("-")
    dispatch(
      setTaskDroppedStart({
        taskId: task.id,
        dropped: true,
        rowId,
        colId: Number(colId),
        cellSpan,
      }),
    )
    setIsGridUpdated(true)
  }

  const handleDragEndBetweenCells = (over: Over, active: Active) => {
    const startCellId = over.id as string
    const task = active.data.current?.task
    const cellSpan = task.duration
    const [rowId, colId] = startCellId.split("-")
    const sourceId = active.id as string
    const [sourceRowId, sourceColId] = sourceId.split("-")
    dispatch(
      moveTaskStart({
        taskId: task.id,
        rowId,
        colId: colId,
        cellSpan,
        sourceRowId,
        sourceColId: Number(sourceColId),
      }),
    )
    setIsGridUpdated(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    rootRef.current?.style.setProperty("cursor", "default")
    if (!event.over) {
      return
    }
    const canDrop = checkCanDrop(event.over, event.active)
    if (event.active.id !== event.over.id && canDrop) {
      if (event.active.data?.current?.source === null) {
        handleDragEndFromSlider(event.over, event.active)
      } else {
        handleDragEndBetweenCells(event.over, event.active)
      }
    }
    setDraggedTask({ draggableId: null, task: null })
  }

  const handleDragStart = (event: DragStartEvent) => {
    rootRef.current?.style.setProperty("cursor", "none")
    setDraggedTask({
      draggableId: String(event.active.id),
      task: event.active.data?.current?.task,
    })
  }

  const handleDragCancel = () => {
    rootRef.current?.style.setProperty("cursor", "default")
    setDraggedTask({ draggableId: null, task: null })
  }

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 1,
    },
  })

  const sensors = useSensors(mouseSensor)

  function snapToGrid(args) {
    const gridX = 50
    const gridY = 100
    const { transform, over, activeNodeRect } = args
    const containerX = containerRef.current?.getBoundingClientRect().left || 0
    const containerY = containerRef.current?.getBoundingClientRect().top || 0
    const activeX = activeNodeRect?.left || 0
    const activeY = activeNodeRect?.top || 0
    const activeHeight = activeNodeRect?.height || 0

    //create snap to grid modifier that is relative to viewport

    if (over) {
      return {
        ...transform,
        x: Math.round(transform.x / gridX) * gridX + containerX,
        y:
          Math.round(transform.y / gridY) * gridY +
          containerY -
          activeY +
          activeHeight / 4 -
          100,
      }
    } else {
      return transform
    }
  }
  return (
    <div ref={rootRef}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <Stack width="100vw" height="100vh">
            <Toolbar />
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              autoScroll={{ layoutShiftCompensation: false }}
              modifiers={[snapToGrid]}
            >
              <TaskSlider />
              <TimelineToolbar />
              <Box ref={containerRef}>
                <Timeline />
              </Box>
            </DndContext>
            <Snackbar
              open={toastState.open}
              autoHideDuration={6000}
              onClose={() => dispatch(setToastClose())}
            >
              <Alert severity={toastState.severity}>{toastState.message}</Alert>
            </Snackbar>
          </Stack>
        </ThemeProvider>
      </LocalizationProvider>
    </div>
  )
}

export default App
