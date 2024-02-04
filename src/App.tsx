import { Stack } from "@mui/material"
import { TaskSlider } from "./components/TaskSlider"
import {
  Active,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Over,
} from "@dnd-kit/core"
import { Toolbar } from "./components/Toolbar"
import { useState } from "react"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { DataGrid } from "./components/DataGrid"
import { ThemeProvider } from "@mui/material/styles"
import { theme } from "../theme"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { ToggleView } from "./components/ToggleView"
import { generateMonthView } from "./generateView"

import { stands as mockStands, tasks as mockTasks } from "./mock-data"

export interface Cell {
  state: string
  task: Task
  source: string
}

export interface CellStateMap {
  cells: {
    [key: string]: Cell
  }
  columnCount?: number
  rowCount?: number
}

export interface Task {
  id: number
  title: string
  description: string
  bgcolor: string
  duration: number
  dropped: boolean
}

export interface Facility {
  id: number
  title: string
  description: string
  bgcolor: string
}

export interface DraggedTask {
  draggableId: string | null
  task: Task | null
}

function App() {
  const [tasks, setTasks] = useState(mockTasks)
  const [view, setView] = useState(generateMonthView(1000))
  const [draggedTask, setDraggedTask] = useState<DraggedTask>({
    draggableId: null,
    task: null,
  })
  const [cellStateMap, setCellStateMap] = useState<CellStateMap>({
    cells: {},
    rowCount: mockStands.length + 1,
    columnCount: view.headerBottomData.length,
  })

  console.log(cellStateMap)

  const checkCanDrop = (over: Over, active: Active) => {
    const overId = over.id
    const task = active.data.current?.task
    const cellSpan = task.duration
    const [x, y] = (overId as string).split("-").map((n: string) => Number(n))
    for (let i = 0; i < cellSpan; i++) {
      const cellId = `${x}-${y + i}`
      if (cellId in cellStateMap.cells) {
        const cell = cellStateMap.cells[cellId]
        if (cell.state !== "empty" && task.id !== cell.task?.id) {
          return false
        }
      }
    }

    return true
  }

  const handleDragEndFromSlider = (over: Over, active: Active) => {
    const overId = over?.id as string
    const task = active.data.current?.task
    const cellSpan = task.duration
    const [x, y] = overId.split("-").map((n: string) => Number(n))
    setTasks((prev: Array<Task>) => {
      const newTasks = prev.filter((t) => t.id !== task.id)
      return newTasks
    })
    setCellStateMap((prev: CellStateMap) => {
      const newStateMap = { ...prev }
      newStateMap.cells[overId] = {
        state: "occupied-start",
        source: overId,
        task,
      }
      if (cellSpan > 1) {
        for (let i = 1; i < cellSpan - 1; i++) {
          newStateMap.cells[`${x}-${y + i}`] = {
            state: "occupied",
            source: overId,
            task,
          }
        }
        newStateMap.cells[`${x}-${y + cellSpan - 1}`] = {
          state: "occupied-end",
          source: overId,
          task,
        }
      }

      return newStateMap
    })
  }

  const handleDragEndBetweenCells = (over: Over, active: Active) => {
    //remove task from cellStateMap
    const task = active.data.current?.task
    const source = active.data.current?.source
    const cellSpan = task.duration
    setCellStateMap((prev: CellStateMap) => {
      const newStateMap = { ...prev }
      const [x, y] = source.split("-").map((n: string) => Number(n))
      delete newStateMap.cells[source]
      if (cellSpan > 1) {
        for (let i = 1; i < cellSpan - 1; i++) {
          delete newStateMap.cells[`${x}-${y + i}`]
        }
        delete newStateMap.cells[`${x}-${y + cellSpan - 1}`]
      }
      return newStateMap
    })

    //add task to cellStateMap
    const overId = over.id as string
    setCellStateMap((prev: CellStateMap) => {
      const newStateMap = { ...prev }
      const [x, y] = overId.split("-").map((n: string) => Number(n))
      newStateMap.cells[overId] = {
        state: "occupied-start",
        source: overId,
        task,
      }
      if (cellSpan > 1) {
        for (let i = 1; i < cellSpan - 1; i++) {
          newStateMap.cells[`${x}-${y + i}`] = {
            state: "occupied",
            source: overId,
            task,
          }
        }
        newStateMap.cells[`${x}-${y + cellSpan - 1}`] = {
          state: "occupied-end",
          source: overId,
          task,
        }
      }
      return newStateMap
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) {
      return
    }
    const canDrop = checkCanDrop(event.over, event.active)
    if (event.active.id !== event.over.id && canDrop) {
      //if task is in the task array)
      if (event.active.data?.current?.source === null) {
        handleDragEndFromSlider(event.over, event.active)
      } else {
        handleDragEndBetweenCells(event.over, event.active)
      }
    }
    setDraggedTask({ draggableId: null, task: null })
  }

  const handleDragStart = (event: DragStartEvent) => {
    if (!event.active.data?.current?.task) {
      return
    }
    setDraggedTask({
      draggableId: String(event.active.id),
      task: event.active.data?.current?.task,
    })
  }

  const handleDragCancel = () => {
    setDraggedTask({ draggableId: null, task: null })
  }

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <Stack width="100vw" height="100vh">
            <Toolbar />
            <ToggleView view={view} setView={setView} />
            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              autoScroll={{ layoutShiftCompensation: false }}
              modifiers={[snapCenterToCursor]}
            >
              <TaskSlider tasks={tasks} />
              <DataGrid
                stands={mockStands}
                cellStateMap={cellStateMap}
                draggedTask={draggedTask}
                view={view}
              />
            </DndContext>
          </Stack>
        </ThemeProvider>
      </LocalizationProvider>
    </>
  )
}

export default App
