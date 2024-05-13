import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import EditIcon from "@mui/icons-material/Edit"
import PersonIcon from "@mui/icons-material/Person"
import { Stack, Typography } from "@mui/material"
import { GridDeleteIcon } from "@mui/x-data-grid"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import {
  Facility as FacilityType,
  deleteFacilityStart,
  undropTasksFromFacilityStart,
} from "../../slices/facilities"
import { ContextMenu } from "../ContextMenu"
import { Modal } from "../DataPanel"
import { selectProject } from "../../selectors/projects"
import { selectInvite } from "../../selectors/invites"
import { FacilityTooltip } from "../FacilityTooltip"

interface FacilityProps {
  facility: FacilityType | null
}

export function Facility({ facility }: FacilityProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [modal, setModal] = useState<Modal | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })

  const dispatch = useAppDispatch()
  const view = useAppSelector((state) => state.view.view)
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
  )
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)
  const project = useAppSelector((state) =>
    selectProject(state, workspaceId, projectId),
  )

  const invite = useAppSelector((state) =>
    selectInvite(state, project?.inviteId),
  )
  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (view?.name !== "1 mies." || invite) return
    if (!anchorEl) {
      setCursorPosition({ left: event.clientX - 2, top: event.clientY - 4 })
      setAnchorEl(event.currentTarget)
      dispatch(setDragDisabled(true))
    }
  }
  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
    dispatch(setDragDisabled(false))
  }

  const contextMenuOptions = [
    {
      title: "Edytuj",
      onClick: () => {
        if (!workspaceId || !projectId) return
        setModal({
          open: true,
          item: "facility",
          workspaceId: workspaceId,
          projectId: projectId,
        })
        setTooltipOpen(false)
        handleClose()
        dispatch(setDragDisabled(true))
      },
      icon: <EditIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Usuń",
      onClick: () => {
        if (!facility) return
        setTooltipOpen(false)
        dispatch(deleteFacilityStart(facility))
        handleClose()
      },
      icon: (
        <DeleteForeverIcon fontSize="small" sx={{ color: "primary.dark" }} />
      ),
    },
    {
      title: "Usuń zadania z osi czasu",
      onClick: () => {
        if (!facility) return
        setTooltipOpen(false)
        dispatch(undropTasksFromFacilityStart(facility))
        handleClose()
      },
      icon: <GridDeleteIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
  ]

  return (
    <>
      {facility ? (
        <FacilityTooltip facility={facility} open={tooltipOpen}>
          <Stack
            justifyContent="center"
            height="100%"
            px={3}
            sx={{
              bgcolor: facility.bgcolor,
              color: "#FFFFFF",
            }}
            onContextMenu={(e) => {
              setTooltipOpen(false)
              handleRightClick(e)
            }}
            position="relative"
            onMouseEnter={() => {
              if (!modal?.open) {
                setTooltipOpen(true)
              }
            }}
            onMouseLeave={() => {
              setTooltipOpen(false)
            }}
          >
            <Typography variant="body2" color="#1E1E1E" fontWeight={600}>
              {facility.title}
            </Typography>
            <ContextMenu
              open={open}
              onClose={handleClose}
              item={facility}
              cursorPosition={cursorPosition}
              options={contextMenuOptions}
              modal={modal}
              setModal={setModal}
            />
            <Stack
              direction="row"
              position="absolute"
              top={1}
              right={2}
              alignItems="center"
              spacing={0.3}
            >
              <Typography fontSize="12px" color="black" fontWeight={600}>
                {facility.manpower}
              </Typography>
              <PersonIcon sx={{ color: "black", fontSize: "15px" }} />
            </Stack>
          </Stack>
        </FacilityTooltip>
      ) : null}
    </>
  )
}
