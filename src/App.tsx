import { Alert, Box, Snackbar, Stack } from "@mui/material"
import { TaskSlider } from "./components/TaskSlider"
import {
  Active,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
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
import { initializeMappings, setMonthView } from "./slices/view"
import { TimelineToolbar } from "./components/TimelineToolbar"
import { syncFacilitiesStart } from "./slices/facilities"
import { initializeGridStart, syncGridStart } from "./slices/grid"
import { syncDeadlinesStart } from "./slices/deadlines"
import { syncWorkspacesStart } from "./slices/workspaces"
import { syncProjectsStart } from "./slices/projects"
import { AuthModal } from "./components/AuthModal"
import { syncUserStart } from "./slices/user"
import { auth } from "../firebase.config"
import { DataPanel } from "./components/DataPanel"
import { selectGrid } from "./selectors/grid"
import { setDelta, setDraggedTask, setOverFacilityId } from "./slices/drag"
import { selectFacilities } from "./selectors/facilities"
import { calculateTaskDurationHelper } from "./components/DataGrid/calculateTaskDurationHelper"
import {
  generateMonthMapping,
  generateWeekMapping,
} from "./components/ToggleView/generateTimeMappings"

export const NUM_OF_DAYS = 100
export const START_DATE = new Date(2024, 1, 1, 0, 0)

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const dispatch = useAppDispatch()
  const monthView = generateMonthView(NUM_OF_DAYS, START_DATE)
  const monthMapping = generateMonthMapping(NUM_OF_DAYS, START_DATE)
  const weekMapping = generateWeekMapping(NUM_OF_DAYS, START_DATE)

  const user = useAppSelector((state) => state.user.user)
  const facilities = useAppSelector((state) =>
    selectFacilities(state, user?.openWorkspaceId),
  )
  const currentUser = auth.currentUser

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setIsAuthModalOpen(!user)
      dispatch(syncUserStart(user?.uid))
    })
  }, [currentUser])

  useEffect(() => {
    dispatch(
      initializeMappings({
        monthMapping: monthMapping,
        weekMapping: weekMapping,
      }),
    )
  }, [])

  useEffect(() => {
    dispatch(syncWorkspacesStart())
    dispatch(syncProjectsStart())
    dispatch(syncTasksStart())
    dispatch(syncFacilitiesStart())
    dispatch(syncGridStart())
    dispatch(syncDeadlinesStart())
    dispatch(initializeGridStart())
  }, [user, user?.openWorkspaceId, user?.openProjectId])

  const toastState = useAppSelector((state) => state.toast)
  const grid = useAppSelector((state) =>
    selectGrid(state, user?.openWorkspaceId),
  )

  useEffect(() => {
    if (grid) dispatch(setMonthView({ view: monthView }))
  }, [dispatch, grid])

  const checkCanDrop = (over: Over, active: Active) => {
    const overId = over.id
    const task = active.data.current?.task
    const [rowId, colId] = (overId as string).split("-")
    if (!facilities || !grid) return false
    const facility = facilities[rowId]
    const increment = 1000 * 60 * 60 * 24
    const actualDuration = calculateTaskDurationHelper({
      manpower: facility.manpower,
      duration: task.duration,
    })
    for (let i = 0; i < actualDuration * increment; i += increment) {
      const cellId = `${rowId}-${Number(colId) + i}`
      if (cellId in grid.cells) {
        const cell = grid.cells[cellId]!
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
    dispatch(setDelta({ x: 0, y: 0 }))
    dispatch(setDraggedTask(null))
    dispatch(
      setTaskDraggedStart({
        task: event.active.data.current?.task,
        dragged: false,
        cellId: event.active.id as string,
      }),
    )
    if (!event.over) {
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
    dispatch(setDraggedTask(event.active.data.current?.task))
    dispatch(
      setTaskDraggedStart({
        task: event.active.data.current?.task,
        dragged: true,
        cellId: event.active.id as string,
      }),
    )
  }

  const handleDragCancel = (event: DragStartEvent) => {
    dispatch(setDraggedTask(null))
    dispatch(setDelta({ x: 0, y: 0 }))
    dispatch(
      setTaskDraggedStart({
        task: event.active.data.current?.task,
        dragged: false,
        cellId: event.active.id as string,
      }),
    )
  }

  const handleDragMove = (event: DragMoveEvent) => {
    if (event.active.data?.current?.sourceId === null) return
    dispatch(
      setDelta({
        x: event.delta.x,
        y: event.delta.y,
      }),
    )
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) {
      dispatch(setOverFacilityId(null))
    } else {
      const cellId = event.over.id as string
      const facilityId = cellId.split("-")[0]
      dispatch(setOverFacilityId(facilityId))
    }
  }

  return (
    <div style={{ maxHeight: "100vh", maxWidth: "100vw", overflow: "hidden" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <Stack width="100vw" height="100vh">
            <AuthModal open={isAuthModalOpen} />
            <Toolbar />
            <DndContext
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragOver={handleDragOver}
              autoScroll={{ enabled: false }}
            >
              <TaskSlider />
              <TimelineToolbar />
              <Stack direction="row" height="100%" overflow="scroll">
                <DataPanel />
                <Box width="100%" height="100%" overflow="scroll">
                  <DataGrid />
                </Box>
              </Stack>
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
