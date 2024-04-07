import Divider from "@mui/material/Divider"
import MenuList from "@mui/material/MenuList"
import MenuItem from "@mui/material/MenuItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import AssignmentIcon from "@mui/icons-material/Assignment"
import { Menu, Typography } from "@mui/material"
import { Task } from "../../slices/tasks"
import { CreateTaskModal } from "../CreateTaskModal"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { updateGridStart } from "../../slices/grid"
import { Facility } from "../../slices/facilities"
import { CreateFacilityModal } from "../CreateFacilityModal"
import { Modal } from "../DataPanel"
import { selectGrid } from "../../selectors/grid"

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
        anchorPosition={{ top: cursorPosition.top, left: cursorPosition.left }}
        transitionDuration={0}
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "white",
            borderRadius: 1,
            cursor: "default",
          },
        }}
      >
        <MenuList dense sx={{ outline: "none" }}>
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
              variant="body1"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {item.title}
            </Typography>
          </MenuItem>
          <Divider sx={{ bgcolor: "primary.dark" }} />
          {options.map((option, idx) => (
            <MenuItem key={idx} onClick={option.onClick}>
              <ListItemIcon>{option.icon}</ListItemIcon>
              <Typography variant="body1" color="text.primary">
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
