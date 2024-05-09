import { Box, Tooltip as MuiTooltip, Stack, Typography } from "@mui/material"
import { ReactElement } from "react"
import { useAppSelector } from "../../hooks"
import { selectFacility } from "../../selectors/facilities"
import { selectProject } from "../../selectors/projects"
import { selectWorkspace } from "../../selectors/workspaces"
import { Task } from "../../slices/tasks"

interface TooltipProps {
  children: ReactElement<any, any>
  task: Task
}

export function TaskTooltip({ children, task }: TooltipProps) {
  const project = useAppSelector((state) =>
    selectProject(state, task.workspaceId, task.projectId),
  )
  const workspace = useAppSelector((state) =>
    selectWorkspace(state, task.workspaceId),
  )
  const facility = useAppSelector((state) =>
    selectFacility(state, task.workspaceId, (task as Task).facilityId),
  )
  return (
    <MuiTooltip
      followCursor
      title={
        <Stack spacing={2} direction="row">
          <Stack>
            <Typography variant="body2" lineHeight="20px">
              Nazwa:
            </Typography>
            <Typography variant="body2" lineHeight="20px">
              Zakład:
            </Typography>
            <Typography variant="body2" lineHeight="20px">
              Projekt:
            </Typography>
            <Typography variant="body2" lineHeight="20px">
              Czas trwania:
            </Typography>
            {task.startTime ? (
              <Typography variant="body2" lineHeight="20px">
                Data rozpoczęcia:
              </Typography>
            ) : null}
            {facility ? (
              <Typography variant="body2" lineHeight="20px">
                Stanowisko:{" "}
              </Typography>
            ) : null}
            <Typography variant="body2" lineHeight="20px">
              Kolor:
            </Typography>
            <Typography variant="body2" lineHeight="20px">
              Stopień zaawansowania:
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="body2" lineHeight="20px" fontWeight={600}>
              {task.title}
            </Typography>
            <Typography variant="body2" lineHeight="20px" fontWeight={600}>
              {workspace?.title}
            </Typography>
            <Typography variant="body2" lineHeight="20px" fontWeight={600}>
              {project?.title}
            </Typography>
            <Typography variant="body2" lineHeight="20px" fontWeight={600}>
              {task.duration} dni
            </Typography>
            {task.startTime ? (
              <Typography variant="body2" lineHeight="20px" fontWeight={600}>
                {new Date(task.startTime).toLocaleDateString()}
              </Typography>
            ) : null}
            {facility ? (
              <Typography variant="body2" lineHeight="20px" fontWeight={600}>
                {facility?.title}
              </Typography>
            ) : null}
            <Box
              bgcolor={task.bgcolor}
              width={20}
              height={20}
              borderRadius={1}
              justifyContent="center"
              alignItems="center"
              sx={{
                cursor: "pointer",
                boxSizing: "border-box",
                border: "1px solid #1D1D1D",
              }}
            />
            <Typography variant="body2" lineHeight="20px" fontWeight={600}>
              {task?.progress}%
            </Typography>
          </Stack>
        </Stack>
      }
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "#f5f5f9",
            color: "rgba(0, 0, 0, 0.87)",
            border: "1px solid #dadde9",
          },
        },
      }}
    >
      {children}
    </MuiTooltip>
  )
}
