import { Stack, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material"
import { useState } from "react"
import { CreateTaskModal } from "../CreateTaskModal"
import { CreateActivityModal } from "../CreateActivityModal"
import { CreateLocationModal } from "../CreateLocationModal"
import { CreateFacilityModal } from "../CreateFacilityModal"
import { CreateDeadlineModal } from "../CreateDeadlineModal"
import { CreateGroupModal } from "../CreateGroupModal"
import AddHomeWork from "@mui/icons-material/AddHomeWork"
import AddTaskIcon from "@mui/icons-material/AddTask"
import AddAlarmIcon from "@mui/icons-material/AddAlarm"
import { CreateWorkspaceModal } from "../CreateWorkspaceModal"

export function Toolbar() {
  const [modalopen, setModalOpen] = useState<string | null>(null)

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
            <AddTaskIcon />
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
      <CreateActivityModal
        open={modalopen === "activity"}
        setOpen={setModalOpen}
      />
      <CreateLocationModal
        open={modalopen === "location"}
        setOpen={setModalOpen}
      />
      <CreateTaskModal open={modalopen === "task"} setOpen={setModalOpen} />
      <CreateFacilityModal
        open={modalopen === "facility"}
        setOpen={setModalOpen}
      />
      <CreateDeadlineModal
        open={modalopen === "deadline"}
        setOpen={setModalOpen}
      />
      <CreateWorkspaceModal
        open={modalopen === "workspace"}
        setOpen={setModalOpen}
      />
      <CreateGroupModal open={modalopen === "group"} setOpen={setModalOpen} />
    </Stack>
  )
}
