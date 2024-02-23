import { Alert, Snackbar, Stack } from "@mui/material"
import { TaskSlider } from "./components/TaskSlider"
import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { Toolbar } from "./components/Toolbar"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@mui/material/styles"
import { theme } from "../theme"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { initializeGridStart, syncGridStart } from "./slices/grid"
import { Task, syncTasksStart } from "./slices/tasks"
import { useAppDispatch, useAppSelector } from "./hooks"
import { syncFacilitiesStart } from "./slices/facilities"
import { setToastClose } from "./slices/toast"
import { TimelineToolbar } from "./components/TimelineToolbar"
import { syncDeadlinesStart } from "./slices/deadlines"
import { TableGrid } from "./components/TableGrid"
import { setDragOver, setDraggedTask } from "./slices/drag"

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
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(syncTasksStart())
    dispatch(syncFacilitiesStart())
    dispatch(syncGridStart())
    dispatch(syncDeadlinesStart())
    dispatch(initializeGridStart())
  }, [dispatch])

  const toastState = useAppSelector((state) => state.toast)

  const handleDragEnd = (event: DragEndEvent) => {
    dispatch(setDragOver(false))
    dispatch(setDraggedTask(null))
    console.log(event)
  }

  const handleDragStart = (event: DragStartEvent) => {
    dispatch(setDraggedTask(String(event.active.id)))
  }

  const handleDragCancel = () => {
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

  function snapToGrid(args) {
    const gridX = 100
    const gridY = 50
    const { transform, over, activeNodeRect } = args
    const activeX = activeNodeRect?.left || 0
    const activeY = activeNodeRect?.top || 0

    if (over) {
      const newTransform = {
        ...transform,
        x:
          Math.round(
            (transform.x + activeX - container.left + container.scrollX) /
              gridX,
          ) *
            gridX -
          activeX +
          container.left -
          container.scrollX,
        y:
          Math.round((transform.y + activeY - container.top + gridY) / gridY) *
            gridY -
          container.top +
          gridY,
      }
      return newTransform
    } else {
      return transform
    }
  }

  return (
    <>
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
              modifiers={[snapToGrid]}
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
    </>
  )
}

export default App
