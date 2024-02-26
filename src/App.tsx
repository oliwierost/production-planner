import { Alert, Snackbar, Stack } from "@mui/material"
import { TaskSlider } from "./components/TaskSlider"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Modifier,
} from "@dnd-kit/core"
import { Toolbar } from "./components/Toolbar"
import { useEffect, useRef, useState } from "react"
import { ThemeProvider } from "@mui/material/styles"
import { theme } from "../theme"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { initializeGridStart, syncGridStart } from "./slices/grid"
import { Task, dropTask, dropTaskStart, syncTasksStart } from "./slices/tasks"
import { useAppDispatch, useAppSelector } from "./hooks"
import { syncFacilitiesStart } from "./slices/facilities"
import { setToastClose } from "./slices/toast"
import { TimelineToolbar } from "./components/TimelineToolbar"
import { syncDeadlinesStart } from "./slices/deadlines"
import { TableGrid } from "./components/TableGrid"
import { setDragOver, setDraggedTask } from "./slices/drag"
import { getTransform } from "./components/TableGrid/getTransformHelper"

export interface DraggedTask {
  draggableId: string | null
  task: Task | null
}

export interface Container {
  left: number
  top: number
  scrollX: number
  scrollY: number
}
function App() {
  const [container, setContainer] = useState<Container>({
    left: 0,
    top: 0,
    scrollX: 0,
    scrollY: 0,
  })
  const rootRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(syncTasksStart())
    dispatch(syncFacilitiesStart())
    dispatch(syncGridStart())
    dispatch(syncDeadlinesStart())
    dispatch(initializeGridStart())
  }, [dispatch])

  const toastState = useAppSelector((state) => state.toast)
  const drag = useAppSelector((state) => state.drag)
  const viewState = useAppSelector((state) => state.view)
  const facilities = useAppSelector((state) => state.facilities.facilities)
  const tasks = useAppSelector((state) => state.tasks.tasks)

  const handleDragEnd = (event: DragEndEvent) => {
    rootRef.current?.style.setProperty("cursor", "default")
    dispatch(setDraggedTask(null))
    dispatch(setDragOver(false))

    const activeX = drag.rect?.left || 0
    const activeY = drag.rect?.top || 0

    const droppableX = container.left || 0
    const droppableY = container.top || 0

    const deltaX = event.delta.x
    const deltaY = event.delta.y

    const task = tasks[drag.draggedTaskId!]

    const x = !task.startTime
      ? -droppableX + deltaX + 100
      : activeX - droppableX + deltaX
    const y = !task.startTime
      ? -droppableY + deltaY
      : activeY - droppableY + deltaY

    const rowIdx = Math.floor(y / 50)
    const colIdx = Math.floor(x / 100)

    const rowVal = Object.values(facilities)[rowIdx]?.id
    const colVal = viewState.view?.headerBottomData[colIdx]?.date!

    dispatch(
      dropTaskStart({
        taskId: event.active.id as string,
        facilityId: rowVal,
        startTime: colVal,
      }),
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    rootRef.current?.style.setProperty("cursor", "none")
    dispatch(setDraggedTask(String(event.active.id)))
  }

  const handleDragCancel = () => {
    rootRef.current?.style.setProperty("cursor", "default")
    dispatch(setDragOver(false))
    dispatch(setDraggedTask(null))
  }

  const handleDragMove = (event: DragEndEvent) => {
    if (event.over) {
      dispatch(setDragOver(true))
    } else {
      dispatch(setDragOver(false))
    }
  }

  const snapToGrid: Modifier = (args) => {
    const gridWidth = 100
    const gridHeight = 50
    const { transform, over, activeNodeRect } = args
    const activeX = activeNodeRect?.left || 0
    const activeY = activeNodeRect?.top || 0
    const isDropped = tasks[drag.draggedTaskId!]?.startTime !== null
    const newTransform = getTransform({
      transform,
      activeX,
      activeY,
      gridWidth,
      gridHeight,
      container,
      over,
      isDropped,
    })
    return newTransform
  }

  return (
    <div ref={rootRef}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <Stack width="100vw" height="100vh">
            <Toolbar />
            <DndContext
              onDragMove={handleDragMove}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              autoScroll={{ enabled: false }}
              modifiers={[(args) => snapToGrid(args)]}
            >
              <TaskSlider />
              <TimelineToolbar />
              <TableGrid setContainer={setContainer} />
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
