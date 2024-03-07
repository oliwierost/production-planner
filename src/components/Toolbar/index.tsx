import {
  Box,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material"
import { useEffect, useState } from "react"
import { CreateTaskModal } from "../CreateTaskModal"
import { CreateActivityModal } from "../CreateActivityModal"
import { CreateLocationModal } from "../CreateLocationModal"
import { CreateFacilityModal } from "../CreateFacilityModal"
import { CreateDeadlineModal } from "../CreateDeadlineModal"
import { CreateGroupModal } from "../CreateGroupModal"
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled"
import HomeWorkIcon from "@mui/icons-material/HomeWork"
import WorkspacesIcon from "@mui/icons-material/Workspaces"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import AssignmentIcon from "@mui/icons-material/Assignment"
import { CreateWorkspaceModal } from "../CreateWorkspaceModal"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { Dropdown } from "../Dropdown"
import { setSelectedWorkspace } from "../../slices/workspaces"
import { setSelectedProject } from "../../slices/projects"
import { CreateProjectModal } from "../CreateProjectModal"

export function Toolbar() {
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const workspacesState = useAppSelector((state) => state.workspaces)
  const projectsState = useAppSelector((state) => state.projects)
  const { workspaces, selectedWorkspace } = workspacesState
  const { projects, selectedProject } = projectsState

  const workspaceOptions = Object.values(workspaces).map((workspace) => ({
    label: workspace?.title,
    value: workspace?.id,
  }))

  const projectOptions = Object.values(projects).map((project) => ({
    label: project?.title,
    value: project?.id,
  }))

  const dispatch = useAppDispatch()
  const renderModal = () => {
    switch (modalOpen) {
      case "task":
        return <CreateTaskModal setOpen={setModalOpen} open={true} />
      case "activity":
        return <CreateActivityModal setOpen={setModalOpen} open={true} />
      case "location":
        return <CreateLocationModal setOpen={setModalOpen} open={true} />
      case "facility":
        return <CreateFacilityModal setOpen={setModalOpen} open={true} />
      case "deadline":
        return <CreateDeadlineModal setOpen={setModalOpen} open={true} />
      case "group":
        return <CreateGroupModal setOpen={setModalOpen} open={true} />
      case "workspace":
        return <CreateWorkspaceModal setOpen={setModalOpen} open={true} />
      case "project":
        return <CreateProjectModal setOpen={setModalOpen} open={true} />
      default:
        return null
    }
  }

  const handleWorkspaceChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string
    dispatch(setSelectedWorkspace(value))
  }

  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string
    dispatch(setSelectedProject(value))
  }

  useEffect(() => {
    if (workspaces && !selectedWorkspace) {
      dispatch(setSelectedWorkspace(Object.keys(workspaces)[0]))
    }
  }, [workspaces])

  useEffect(() => {
    if (projects && selectedWorkspace) {
      dispatch(setSelectedProject(Object.keys(projects)[0]))
    }
  }, [projects, selectedWorkspace])

  return (
    <Stack
      direction="row"
      width="100%"
      bgcolor="lightgrey"
      alignItems="center"
      justifyContent="space-between"
      borderTop="1px solid #000000"
    >
      <ToggleButtonGroup>
        <Tooltip title="Dodaj zakład" arrow>
          <ToggleButton
            value="workspace"
            onClick={() => setModalOpen("workspace")}
            sx={{
              px: 1,
              py: 0.5,
              border: "none",
              "&:focus": {
                outline: "none",
              },
            }}
          >
            <WorkspacesIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Dodaj projekt" arrow>
          <ToggleButton
            value="project"
            onClick={() => setModalOpen("project")}
            sx={{
              px: 1,
              py: 0.5,
              border: "none",
              "&:focus": {
                outline: "none",
              },
            }}
          >
            <AccountTreeIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Dodaj produkt" arrow>
          <ToggleButton
            value="facility"
            onClick={() => setModalOpen("task")}
            sx={{
              px: 1,
              py: 0.5,
              border: "none",
              "&:focus": {
                outline: "none",
              },
            }}
          >
            <AssignmentIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Dodaj stanowisko" arrow>
          <ToggleButton
            value="task"
            onClick={() => setModalOpen("facility")}
            sx={{
              px: 1,
              py: 0.5,
              border: "none",
              "&:focus": {
                outline: "none",
              },
            }}
          >
            <HomeWorkIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Dodaj deadline" arrow>
          <ToggleButton
            value="task"
            onClick={() => setModalOpen("deadline")}
            sx={{
              px: 1,
              py: 0.5,
              border: "none",
              "&:focus": {
                outline: "none",
              },
            }}
          >
            <AccessTimeFilledIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Stack direction="row">
        <Dropdown
          variant="toolbar"
          placeholder="Wybierz projekt"
          options={projectOptions ?? []}
          onChange={handleProjectChange}
          value={selectedProject && selectedWorkspace ? selectedProject : ""}
          width={250}
        />
        <Dropdown
          variant="toolbar"
          placeholder="Wybierz zakład"
          options={workspaceOptions}
          onChange={handleWorkspaceChange}
          value={selectedWorkspace || ""}
          width={250}
        />
      </Stack>
      <Box position="absolute">{renderModal()}</Box>
    </Stack>
  )
}
