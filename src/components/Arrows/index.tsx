import { Task, taskId } from "../../slices/tasks"
import { Arrow } from "./Arrow"
import { Facility } from "../../slices/facilities"

interface ArrowsProps {
  requiredTasks: { [key: taskId]: Task }
  task: Task
  taskWidth: number
  overFacility: Facility | null
  colId: string
}

export function Arrows({
  requiredTasks,
  task,
  taskWidth,
  overFacility,
  colId,
}: ArrowsProps) {
  return (
    <a>
      {Object.values(requiredTasks).map((requiredTask) => {
        return (
          <Arrow
            key={requiredTask.id}
            fromTask={requiredTask}
            toTask={task}
            taskWidth={taskWidth}
            overFacility={overFacility}
            colId={colId}
          />
        )
      })}
    </a>
  )
}
