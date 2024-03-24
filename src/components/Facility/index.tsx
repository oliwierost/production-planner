import EditIcon from "@mui/icons-material/Edit"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { Stack, Typography } from "@mui/material"
import {
  Facility as FacilityType,
  deleteFacilityStart,
} from "../../slices/facilities"
import { ContextMenu } from "../ContextMenu"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import { updateGridStart } from "../../slices/grid"
import PersonIcon from "@mui/icons-material/Person"
import { Modal } from "../DataPanel"
import { selectGrid } from "../../selectors/grid"

interface FacilityProps {
  facility: FacilityType
}

export function Facility({ facility }: FacilityProps) {
  const [modal, setModal] = useState<Modal | null>(null)
  const [isGridUpdated, setIsGridUpdated] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })

  const dispatch = useAppDispatch()
  const view = useAppSelector((state) => state.view.view)
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
  )
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)
  const grid = useAppSelector((state) => selectGrid(state, workspaceId))

  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (view?.name !== "1 mies.") return
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
        handleClose()
        dispatch(setDragDisabled(true))
      },
      icon: <EditIcon fontSize="small" sx={{ color: "primary.dark" }} />,
    },
    {
      title: "Usuń",
      onClick: () => {
        dispatch(deleteFacilityStart(facility))
        setIsGridUpdated(true)
        handleClose()
      },
      icon: (
        <DeleteForeverIcon fontSize="small" sx={{ color: "primary.dark" }} />
      ),
    },
  ]

  useEffect(() => {
    if (isGridUpdated && grid) {
      dispatch(updateGridStart(grid))
      setIsGridUpdated(false)
    }
  }, [isGridUpdated, dispatch, grid])

  return (
    <>
      {facility ? (
        <Stack
          justifyContent="center"
          height="100%"
          px={3}
          sx={{
            bgcolor: facility.bgcolor,
            color: "#FFFFFF",
          }}
          onContextMenu={(e) => handleRightClick(e)}
          position="relative"
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
            isGridUpdated={isGridUpdated}
            setIsGridUpdated={setIsGridUpdated}
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
      ) : null}
    </>
  )
}
