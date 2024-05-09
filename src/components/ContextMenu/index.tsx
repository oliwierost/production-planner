import AssignmentIcon from "@mui/icons-material/Assignment"
import { Menu, Typography } from "@mui/material"
import ListItemIcon from "@mui/material/ListItemIcon"
import MenuItem from "@mui/material/MenuItem"
import MenuList from "@mui/material/MenuList"
import { useEffect } from "react"
import { useAppSelector } from "../../hooks"
import { Facility } from "../../slices/facilities"
import { Task } from "../../slices/tasks"
import { CreateFacilityModal } from "../CreateFacilityModal"
import { CreateTaskModal } from "../CreateTaskModal"
import { Modal } from "../DataPanel"

interface ContextMenuProps {
  open: boolean
  onClose: () => void
  modal: Modal | null
  setModal: React.Dispatch<React.SetStateAction<Modal | null>>
  item: Task | Facility
  cursorPosition: { top: number; left: number }
  options: { title: string; onClick: () => void; icon: JSX.Element }[]
}

export function ContextMenu({
  open,
  onClose,
  item,
  cursorPosition,
  options,
  modal,
  setModal,
}: ContextMenuProps) {
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
  )

  useEffect(() => {
    if (modal) {
      onClose()
    }
  }, [modal, onClose])

  if (!projectId || !workspaceId) return null

  return (
    <>
      <Menu
        open={modal ? false : open}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: cursorPosition.top + 18,
          left: cursorPosition.left,
        }}
        transitionDuration={0}
        elevation={0}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#f5f5f9",
            color: "rgba(0, 0, 0, 0.87)",
            border: "1px solid #dadde9",
          },
        }}
      >
        <MenuList dense sx={{ outline: "none", width: "fit-content" }}>
          <MenuItem
            disableTouchRipple
            sx={{
              cursor: "default",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <ListItemIcon>
              <AssignmentIcon fontSize="small" sx={{ color: "primary.dark" }} />
            </ListItemIcon>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {item.title}
            </Typography>
          </MenuItem>
          {options.map((option, idx) => (
            <MenuItem key={idx} onClick={option.onClick}>
              <ListItemIcon>{option.icon}</ListItemIcon>
              <Typography variant="body2" color="text.primary">
                {option.title}
              </Typography>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      {modal && modal.item == "task" ? (
        <CreateTaskModal
          setModal={setModal}
          open={modal.open}
          taskId={item.id}
          projectId={projectId}
          workspaceId={workspaceId}
        />
      ) : null}
      {modal && modal.item == "facility" ? (
        <CreateFacilityModal
          setModal={setModal}
          open={modal.open}
          facilityId={item.id}
          workspaceId={workspaceId}
        />
      ) : null}
    </>
  )
}
