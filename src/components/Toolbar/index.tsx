import { Logout } from "@mui/icons-material"
import { Stack, ToggleButton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { Project } from "../../slices/projects"
import { signOutStart } from "../../slices/user"
import { Workspace } from "../../slices/workspaces"

export function Toolbar() {
  const [project, setProject] = useState<Project>()
  const [workspace, setWorkspace] = useState<Workspace>()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user.user)

  const openWorkspaceId = user?.openWorkspaceId
  const openProjectId = user?.openProjectId

  const projects = useAppSelector((state) => state.projects.projects)
  const workspaces = useAppSelector((state) => state.workspaces.workspaces)

  useEffect(() => {
    if (openWorkspaceId && workspaces) {
      const workspace = workspaces[openWorkspaceId]
      setWorkspace(workspace)
    }
  }, [openWorkspaceId, workspaces])

  useEffect(() => {
    if (
      openProjectId &&
      projects &&
      openWorkspaceId &&
      projects[openWorkspaceId]
    ) {
      const project = projects[openWorkspaceId][openProjectId]
      setProject(project)
    }
  }, [openProjectId, projects, openWorkspaceId])

  return (
    <Stack
      direction="row"
      width="100%"
      bgcolor="lightgrey"
      borderBottom="1px solid black"
      alignItems="center"
      justifyContent="space-between"
    >
      <ToggleButton
        value="logout"
        onClick={() => dispatch(signOutStart())}
        sx={{
          px: 1,
          py: 0.5,
          border: "none",
          "&:focus": {
            outline: "none",
          },
        }}
      >
        <Logout />
      </ToggleButton>
      {project && workspace ? (
        <Stack direction="row" spacing={2} pr={4}>
          <Stack direction="row">
            <Typography variant="body2">
              Zakład: <span>{workspace?.title}</span>
            </Typography>
          </Stack>
          <Stack direction="row">
            <Typography variant="body2">
              Projekt: <span>{project?.title}</span>
            </Typography>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  )
}
