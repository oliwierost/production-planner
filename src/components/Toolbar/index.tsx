import SearchIcon from "@mui/icons-material/Search"
import MenuIcon from "@mui/icons-material/Menu"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { Stack } from "@mui/material"
import { ToolbarIcon } from "../ToolbarIcon"
import { PopoverCreate } from "../PopoverCreate"
import { useState } from "react"
import { CreateTaskModal } from "../CreateTaskModal"
import { CreateActivityModal } from "../CreateActivityModal"
import { CreateLocationModal } from "../CreateLocationModal"
import { CreateStandModal } from "../CreateStandModal"
import { CreateDeadlineModal } from "../CreateDeadlineModal"
import { CreateGroupModal } from "../CreateGroupModal"

const icons = [
  {
    icon: <CalendarMonthIcon />,
    iconText: "idź do",
    expandMore: true,
  },
  {
    icon: <FilterAltIcon />,
    iconText: "Filtruj",
  },
  {
    icon: <SearchIcon />,
    iconText: "Szukaj",
  },
  {
    icon: <MoreVertIcon />,
    iconText: "Więcej",
    expandMore: true,
  },
]

export function Toolbar() {
  const [anchorEl, setAnchorEl] = useState(null as HTMLButtonElement | null)
  const [modalopen, setModalOpen] = useState(null)

  const handleCreateOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <Stack
      direction="row"
      width="100%"
      minHeight="2.2rem"
      bgcolor="lightgrey"
      alignItems="center"
      justifyContent="space-between"
      borderTop="1px solid #000000"
    >
      <Stack direction="row" height="100%" width="100%">
        <ToolbarIcon icon={<MenuIcon />} />
        <button style={{ all: "unset" }} onClick={handleCreateOpen}>
          <ToolbarIcon
            icon={<AddCircleOutlineIcon />}
            iconText="Dodaj"
            expandMore={true}
            onClick={handleCreateOpen}
          />
        </button>
      </Stack>
      <Stack direction="row">
        {icons.map((icon, idx) => (
          <ToolbarIcon
            key={idx}
            icon={icon.icon}
            iconText={icon.iconText}
            expandMore={icon.expandMore}
          />
        ))}
      </Stack>
      <PopoverCreate
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        setModalOpen={
          setModalOpen as unknown as React.Dispatch<
            React.SetStateAction<string>
          >
        }
      />
      <CreateActivityModal
        open={modalopen === "activity"}
        setOpen={setModalOpen}
      />
      <CreateLocationModal
        open={modalopen === "location"}
        setOpen={setModalOpen}
      />
      <CreateTaskModal open={modalopen === "task"} setOpen={setModalOpen} />
      <CreateStandModal open={modalopen === "stand"} setOpen={setModalOpen} />
      <CreateDeadlineModal
        open={modalopen === "deadline"}
        setOpen={setModalOpen}
      />
      <CreateGroupModal open={modalopen === "group"} setOpen={setModalOpen} />
    </Stack>
  )
}
