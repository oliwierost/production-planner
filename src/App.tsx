import { Alert, Snackbar, Stack } from "@mui/material"
import { TaskSlider } from "./components/TaskSlider"
import {
  Active,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Over,
} from "@dnd-kit/core"
import { Toolbar } from "./components/Toolbar"
import { useEffect, useState } from "react"
import { DataGrid } from "./components/DataGrid"
import { ThemeProvider } from "@mui/material/styles"
import { theme } from "../theme"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { generateMonthView } from "./generateView"
import {
  moveTaskStart,
  setTaskDraggedStart,
  setTaskDroppedStart,
  syncTasksStart,
} from "./slices/tasks"
import { useAppDispatch, useAppSelector } from "./hooks"
import { setToastClose, setToastOpen } from "./slices/toast"
import { setMonthView } from "./slices/view"
import { TimelineToolbar } from "./components/TimelineToolbar"
import { syncFacilitiesStart } from "./slices/facilities"
import { initializeGridStart, syncGridStart } from "./slices/grid"
import { syncDeadlinesStart } from "./slices/deadlines"
import { syncWorkspacesStart } from "./slices/workspaces"
import { syncProjectsStart } from "./slices/projects"
import { AuthModal } from "./components/AuthModal"
import { syncUserStart } from "./slices/user"
import { auth } from "../firebase.config"

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const dispatch = useAppDispatch()
  const monthView = generateMonthView(100)
  const selectedWorkspace = useAppSelector(
    (state) => state.workspaces.selectedWorkspace,
  )
  const selectedProject = useAppSelector(
    (state) => state.projects.selectedProject,
  )
  const currentUser = auth.currentUser

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setIsAuthModalOpen(!user)
      dispatch(syncUserStart(user?.uid))
    })
  }, [currentUser])

  useEffect(() => {
    if (!selectedWorkspace && !selectedProject) {
      dispatch(syncWorkspacesStart())
    } else if (selectedWorkspace && !selectedProject) {
      dispatch(syncProjectsStart())
    } else if (selectedWorkspace && selectedProject) {
      dispatch(syncTasksStart())
      dispatch(syncFacilitiesStart())
      dispatch(syncGridStart())
      dispatch(syncDeadlinesStart())
      dispatch(initializeGridStart())
    }
  }, [selectedWorkspace, selectedProject])

  const toastState = useAppSelector((state) => state.toast)
  const gridState = useAppSelector((state) => state.grid)
  const cellStateMap = gridState.grid

  useEffect(() => {
    if (cellStateMap) {
      dispatch(setMonthView({ view: monthView, grid: cellStateMap }))
    }
  }, [dispatch, cellStateMap])

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
            setTaskDraggedStart({
              task: active.data.current?.task,
              dragged: false,
              cellId: active.id as string,
            }),
          )
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
    const [rowId, colId] = cellId.split("-")
    dispatch(
      setTaskDroppedStart({
        dropped: true,
        rowId,
        colId: Number(colId),
        task,
      }),
    )
  }

  const handleDragEndBetweenCells = (over: Over, active: Active) => {
    const startCellId = over.id as string
    const task = active.data.current?.task
    const [rowId, colId] = startCellId.split("-")
    const sourceId = active.id as string
    const [sourceRowId, sourceColId] = sourceId.split("-")
    dispatch(
      moveTaskStart({
        rowId,
        colId: colId,
        sourceRowId,
        sourceColId: Number(sourceColId),
        task,
      }),
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) {
      dispatch(
        setTaskDraggedStart({
          task: event.active.data.current?.task,
          dragged: false,
          cellId: event.active.id as string,
        }),
      )
      return
    }
    const canDrop = checkCanDrop(event.over, event.active)
    if (canDrop) {
      if (event.active.data?.current?.sourceId === null) {
        handleDragEndFromSlider(event.over, event.active)
      } else {
        handleDragEndBetweenCells(event.over, event.active)
      }
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    dispatch(
      setTaskDraggedStart({
        task: event.active.data.current?.task,
        dragged: true,
        cellId: event.active.id as string,
      }),
    )
  }

  const handleDragCancel = (event: DragStartEvent) => {
    dispatch(
      setTaskDraggedStart({
        task: event.active.data.current?.task,
        dragged: false,
        cellId: event.active.id as string,
      }),
    )
  }

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <Stack width="100vw" height="100vh">
            <AuthModal open={isAuthModalOpen} />
            <Toolbar />
            <DndContext
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              autoScroll={{ enabled: false }}
            >
              <TaskSlider />
              <TimelineToolbar />
              <DataGrid />
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
