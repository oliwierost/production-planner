import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  Over,
  useSensor,
} from "@dnd-kit/core"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { Alert, Box, Snackbar, Stack } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useEffect, useState } from "react"
import { auth } from "../firebase.config"
import { theme } from "../theme"
import { AuthModal } from "./components/AuthModal"
import { DataGrid } from "./components/DataGrid"
import { calculateTaskDurationHelper } from "./components/DataGrid/calculateTaskDurationHelper"
import { DataPanel } from "./components/DataPanel"
import { TaskSlider } from "./components/TaskSlider"
import { TimelineToolbar } from "./components/TimelineToolbar"
import {
  generateMonthMapping,
  generateWeekMapping,
} from "./components/ToggleView/generateTimeMappings"
import { Toolbar } from "./components/Toolbar"
import { generateMonthView } from "./generateView"
import { useAppDispatch, useAppSelector } from "./hooks"
import { selectFacilities } from "./selectors/facilities"
import { selectGrid } from "./selectors/grid"
import { selectProject } from "./selectors/projects"
import {
  syncCollabDeadlinesStart,
  syncDeadlinesStart,
} from "./slices/deadlines"
import { setDraggedTask, setOverFacilityId } from "./slices/drag"
import {
  Condition,
  Facility,
  syncCollabFacilitiesStart,
  syncFacilitiesStart,
} from "./slices/facilities"
import {
  initializeGridStart,
  syncCollabGridStart,
  syncGridStart,
} from "./slices/grid"
import { syncInvitesStart } from "./slices/invites"
import { syncCollabProjectsStart, syncProjectsStart } from "./slices/projects"
import { syncCollabRaportsStart, syncRaportsStart } from "./slices/raports"
import {
  moveTaskStart,
  setTaskDroppedStart,
  syncCollabTasksStart,
  syncTasksStart,
  Task,
} from "./slices/tasks"
import { setToastClose, setToastOpen } from "./slices/toast"
import { syncUserStart } from "./slices/user"
import { initializeMappings, setMonthView } from "./slices/view"
import {
  syncCollabWorkspacesStart,
  syncWorkspacesStart,
} from "./slices/workspaces"

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const dispatch = useAppDispatch()

  const user = useAppSelector((state) => state.user.user)
  const facilities = useAppSelector((state) =>
    selectFacilities(state, user?.openWorkspaceId),
  )
  const invites = useAppSelector((state) => state.invites.invites)
  const openProjectId = useAppSelector(
    (state) => state.user.user?.openProjectId,
  )
  const openWorkspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
  )
  const openProject = useAppSelector((state) =>
    selectProject(state, openWorkspaceId, openProjectId),
  )

  const currentUser = auth.currentUser

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setIsAuthModalOpen(!user)
      dispatch(syncUserStart(user?.uid))
    })
  }, [currentUser])

  useEffect(() => {
    if (openProject) {
      const monthMapping = generateMonthMapping(
        openProject.startTime,
        openProject.endTime,
      )
      const weekMapping = generateWeekMapping(
        openProject.startTime,
        openProject.endTime,
      )
      dispatch(
        initializeMappings({
          monthMapping: monthMapping,
          weekMapping: weekMapping,
        }),
      )
    }
  }, [openProject])

  useEffect(() => {
    dispatch(syncWorkspacesStart())
    dispatch(syncProjectsStart())
    dispatch(syncTasksStart())
    dispatch(syncFacilitiesStart())
    dispatch(syncGridStart())
    dispatch(syncDeadlinesStart())
    dispatch(initializeGridStart())
    dispatch(syncInvitesStart())
    dispatch(syncRaportsStart())
  }, [user, user?.openWorkspaceId, user?.openProjectId])

  useEffect(() => {
    dispatch(syncCollabWorkspacesStart())
    dispatch(syncCollabProjectsStart())
    dispatch(syncCollabFacilitiesStart())
    dispatch(syncCollabGridStart())
    dispatch(syncCollabTasksStart())
    dispatch(syncCollabDeadlinesStart())
    dispatch(syncCollabRaportsStart())
  }, [user, invites])

  const toastState = useAppSelector((state) => state.toast)
  const grid = useAppSelector((state) =>
    selectGrid(state, user?.openWorkspaceId),
  )

  useEffect(() => {
    if (grid && openProject) {
      const monthView = generateMonthView(
        openProject.startTime,
        openProject.endTime,
      )

      dispatch(setMonthView({ view: monthView }))
    }
  }, [dispatch, grid, openProject])

  const checkConditions = (
    conditions: Condition[],
    task: Task,
    facility: Facility,
  ) => {
    if (!conditions) return true
    for (const condition of conditions) {
      const taskAttribute = condition.taskAttribute
      const operator = condition.operator
      const facilityAttribute = condition.facilityAttribute
      const taskAttributeValue = task.attributes[taskAttribute].value
      const facilityAttributeValue =
        facility.attributes[facilityAttribute].value

      switch (operator) {
        case "==":
          if (taskAttributeValue !== facilityAttributeValue) return false
          break
        case "!=":
          if (taskAttributeValue == facilityAttributeValue) return false
      }
    }
    return true
  }

  const checkCanDrop = (over: Over, active: Active) => {
    const overId = over.id
    const task = active.data.current?.task
    const [rowId, colId] = (overId as string).split("-")
    if (!facilities || !grid || !openProjectId) return false
    const facility = facilities[rowId]
    const conditions = facility.conditions[openProjectId]
    const areConditionsMet = checkConditions(conditions, task, facility)
    console.log("areConditionsMet", areConditionsMet)
    if (!areConditionsMet) {
      dispatch(
        setToastOpen({
          message: "Nie spełniono warunków",
          severity: "error",
        }),
      )
      return false
    }
    const increment = 1000 * 60 * 60 * 24
    const actualDuration = calculateTaskDurationHelper({
      manpower: facility.manpower,
      duration: task.duration,
    })

    for (let i = 0; i < actualDuration * increment; i += increment) {
      const cellId = `${rowId}-${Number(colId) + i}`
      if (cellId in grid.cells) {
        const cell = grid.cells[cellId]!
        if (cell.taskId !== task.id) {
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
    const sourceId = active.data.current?.sourceId
    const [rowId, colId] = startCellId.split("-")
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
    dispatch(
      setDraggedTask({
        task: null,
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
    dispatch(setDraggedTask({ task: event.active.data.current?.task }))
  }

  const handleDragCancel = () => {
    dispatch(
      setDraggedTask({
        task: null,
      }),
    )
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) {
      dispatch(setOverFacilityId(null))
    } else {
      const cellId = event.over.id as string
      const delimiterIndex = cellId.indexOf("-")
      const facilityId =
        delimiterIndex !== -1 ? cellId.substring(0, delimiterIndex) : cellId

      dispatch(setOverFacilityId(facilityId))
    }
  }

  //create mouse sensor
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  })

  return (
    <div
      style={{
        maxHeight: "100vh",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <Stack width="100vw" height="100vh">
            <AuthModal open={isAuthModalOpen} />
            <Toolbar />
            <DndContext
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragOver={handleDragOver}
              autoScroll={{ enabled: false }}
              modifiers={[snapCenterToCursor]}
              sensors={[mouseSensor]}
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
