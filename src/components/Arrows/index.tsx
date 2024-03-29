import { Box } from "@mui/material"
import { Task, taskId } from "../../slices/tasks"
import { Arrow } from "./Arrow"
import { Facility } from "../../slices/facilities"

interface ArrowsProps {
  requiredTasks: { [key: taskId]: Task }
  task: Task
  taskWidth: number
  overFacility: Facility | null
}

export function Arrows({
  requiredTasks,
  task,
  taskWidth,
  overFacility,
}: ArrowsProps) {
  return (
    <a>
      {Object.values(requiredTasks).map((requiredTask) => {
        return (
          <Arrow
            fromTask={requiredTask}
            toTask={task}
            taskWidth={taskWidth}
            overFacility={overFacility}
          />
        )
      })}
    </a>
  )
}
