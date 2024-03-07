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
import AddHomeWork from "@mui/icons-material/AddHomeWork"
import AddTaskIcon from "@mui/icons-material/AddTask"
import AddAlarmIcon from "@mui/icons-material/AddAlarm"
import WorkspacesIcon from "@mui/icons-material/Workspaces"
import { CreateWorkspaceModal } from "../CreateWorkspaceModal"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { Dropdown } from "../Dropdown"
import { setSelectedWorkspace } from "../../slices/workspaces"

export function Toolbar() {
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const workspacesState = useAppSelector((state) => state.workspaces)
  const { workspaces, selectedWorkspace } = workspacesState

  const workspaceOptions = Object.values(workspaces).map((workspace) => ({
    label: workspace?.title,
    value: workspace?.id,
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
      default:
        return null
    }
  }

  const handleWorkspaceChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string
    dispatch(setSelectedWorkspace(value))
  }

  useEffect(() => {
    if (workspaces && !selectedWorkspace) {
      dispatch(setSelectedWorkspace(Object.keys(workspaces)[0]))
    }
  }, [workspaces])

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
            <AddTaskIcon />
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
            <AddHomeWork />
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
            <AddAlarmIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Stack direction="row">
        <Dropdown
          variant="toolbar"
          placeholder="Wybierz zakład"
          options={workspaceOptions}
          onChange={handleWorkspaceChange}
          value={selectedWorkspace || ""}
          width={200}
        />
      </Stack>
      <Box position="absolute">{renderModal()}</Box>
    </Stack>
  )
}
