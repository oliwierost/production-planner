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

interface FacilityProps {
  facility: FacilityType
}

export function Facility({ facility }: FacilityProps) {
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const [isGridUpdated, setIsGridUpdated] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 })

  const dispatch = useAppDispatch()
  const view = useAppSelector((state) => state.view.view)
  const gridState = useAppSelector((state) => state.grid)

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
        setModalOpen("updateFacility")
        handleClose()
        dispatch(setDragDisabled(true))
      },
      icon: <EditIcon fontSize="small" sx={{ color: "black" }} />,
    },
    {
      title: "Usuń",
      onClick: () => {
        dispatch(deleteFacilityStart(facility))
        setIsGridUpdated(true)
        handleClose()
      },
      icon: <DeleteForeverIcon fontSize="small" sx={{ color: "black" }} />,
    },
  ]

  useEffect(() => {
    if (isGridUpdated && gridState.grid !== null) {
      dispatch(updateGridStart(gridState.grid))
      setIsGridUpdated(false)
    }
  }, [isGridUpdated, dispatch, gridState.grid])

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
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
          />
        </Stack>
      ) : null}
    </>
  )
}
