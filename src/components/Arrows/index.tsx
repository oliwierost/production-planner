import { Box } from "@mui/material"
import { Task, taskId } from "../../slices/tasks"
import { Arrow } from "./Arrow"

interface ArrowsProps {
  requiredTasks: { [key: taskId]: Task }
  task: Task
  newDuration: number
}

export function Arrows({ requiredTasks, task, newDuration }: ArrowsProps) {
  return (
    <>
      {Object.values(requiredTasks).map((requiredTask) => {
        return (
          <Box sx={{ position: "absolute", top: "50%" }}>
            <Arrow
              fromTask={requiredTask}
              toTask={task}
              newDuration={newDuration}
            />
          </Box>
        )
      })}
    </>
  )
}
