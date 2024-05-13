import { Box, Modal as MuiModal, Stack } from "@mui/material"
import { useState, useEffect } from "react"
import { TitleBar } from "../TitleBar"

interface ModalProps {
  open: boolean
  children: React.ReactNode
  onClose?: () => void
  blur?: boolean
}

export function Modal({ open, children, onClose, blur = false }: ModalProps) {
  const [transform, setTransform] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [dragging, setDragging] = useState<boolean>(false)
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (dragging) {
        setTransform({
          x: event.clientX - position.x,
          y: event.clientY - position.y,
        })
      }
    }

    const handleMouseUp = () => {
      if (dragging) {
        setDragging(false)
      }
    }

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging, position])

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true)
    setPosition({
      x: event.clientX - transform.x,
      y: event.clientY - transform.y,
    })
  }

  return (
    <MuiModal
      open={open}
      onClose={onClose ? () => onClose() : () => null}
      sx={{
        "& .MuiBackdrop-root": {
          bgcolor: "transparent",
          backdropFilter: blur ? "blur(8px)" : "none",
        },
      }}
    >
      <Stack
        alignItems="center"
        width="fit-content"
        position="absolute"
        top="50%"
        left="50%"
        sx={{
          outline: "none",
          transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px))`,
        }}
        border="1px solid #1E1E1E"
        boxShadow={16}
        maxHeight="100vh"
      >
        <Box
          onMouseDown={handleMouseDown}
          width="100%"
          sx={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          <TitleBar onClose={onClose ? () => onClose() : () => null} />
        </Box>
        {children}
      </Stack>
    </MuiModal>
  )
}
