import { Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { calculateTaskWidthHelper } from "../DataGrid/calculateTaskWidthHelper"
import { useAppSelector } from "../../hooks"
import { selectFacility } from "../../selectors/facilities"
import { Task } from "../../slices/tasks"
import { isEqual } from "lodash"

interface DraggedTaskProps {
  task: Task
}

export function DraggedTask({ task }: DraggedTaskProps) {
  const workspaceId = task.workspaceId
  const view = useAppSelector((state) => state.view.view)
  const overFacilityId = useAppSelector(
    (state) => state.drag.overFacilityId,
    isEqual,
  )

  const overFacility = useAppSelector(
    (state) => selectFacility(state, workspaceId, overFacilityId),
    isEqual,
  )

  const getTaskWidth = () => {
    if (!view) return 0
    if (overFacility) {
      return calculateTaskWidthHelper({
        duration: task.duration,
        cellWidth: view.cellWidth,
        manpower: overFacility!.manpower,
        daysInCell: view?.daysInCell,
      })
    } else {
      return calculateTaskWidthHelper({
        duration: task.duration,
        cellWidth: view.cellWidth,
        manpower: 1,
        daysInCell: view?.daysInCell,
      })
    }
  }

  const [taskWidth, setTaskWidth] = useState(getTaskWidth())

  useEffect(() => {
    setTaskWidth(getTaskWidth())
  }, [overFacility])

  return (
    <Stack
      width={taskWidth}
      height="30px"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        transition: "width 0.1s ease", // Apply transition inline
        bgcolor: task.bgcolor,
        color: "background.default",
        borderRadius: 1,
        border: "1px solid black",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="body2"
        fontWeight={700}
        noWrap
        sx={{
          maxWidth: "100%",
          boxSizing: "border-box",
          textOverflow: "ellipsis",
          overflow: "hidden",
          px: "min(20px, 10%)",
        }}
      >
        {task.title}
      </Typography>
    </Stack>
  )
}
