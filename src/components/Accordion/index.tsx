import {
  AccordionDetails,
  AccordionSummary,
  Typography,
  Accordion as MuiAccordion,
  Stack,
  IconButton,
  Checkbox,
} from "@mui/material"
import { useState } from "react"
import { Add, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setProjectOpenStart, setWorkspaceOpenStart } from "../../slices/user"
import { Modal } from "../DataPanel"

interface AccordionProps {
  summary: string
  children: React.ReactNode
  variant?: "collection" | "document"
  item: "workspace" | "project" | "task" | "deadline" | "facility"
  projectId?: string
  workspaceId?: string
  setModal?: React.Dispatch<React.SetStateAction<Modal | null>>
  border?: boolean
}

export function Accordion({
  summary,
  children,
  variant,
  item,
  projectId,
  workspaceId,
  setModal,
  border = true,
}: AccordionProps) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const openProjectId = useAppSelector(
    (state) => state.user.user?.openProjectId,
  )
  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (setModal) {
      setModal({
        open: true,
        item: item,
        projectId: projectId || "",
        workspaceId: workspaceId || "",
      })
    }
  }

  const handleCheck = () => {
    if (workspaceId && projectId) {
      dispatch(setWorkspaceOpenStart(workspaceId))
      dispatch(setProjectOpenStart(projectId))
    }
  }

  return (
    <MuiAccordion
      disableGutters
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      slotProps={{
        transition: {
          timeout: 0,
        },
      }}
      sx={{
        //remove transition
        all: "unset",
        boxShadow: "none",
        backgroundColor: "transparent",
        "&:before": {
          display: "none",
        },
        "& .MuiAccordionSummary-root": {
          bgcolor: projectId == openProjectId ? "primary.light" : "transparent",
          p: 0,
          height: "15px",
          minHeight: "35px",
        },
        "& .MuiAccordionDetails-root": {
          bgcolor: projectId == openProjectId ? "primary.light" : "transparent",
          p: 0,
          pl: 2,
          borderLeft: border ? "1px solid black" : "none",
        },
      }}
    >
      <AccordionSummary>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={1}
          width="100%"
        >
          <Stack direction="row" alignItems="center" spacing={1} width="100%">
            {!expanded ? (
              <KeyboardArrowDown sx={{ fontSize: "12px" }} />
            ) : (
              <KeyboardArrowUp sx={{ fontSize: "12px" }} />
            )}
            <Typography
              variant="body2"
              sx={{
                textDecoration: variant == "collection" ? "underline" : "none",
              }}
            >
              {summary}
            </Typography>
          </Stack>
          {variant == "document" && item == "project" ? (
            <Checkbox
              checked={openProjectId == projectId}
              onChange={() => handleCheck()}
              onClick={(e) => e.stopPropagation()}
              size="small"
            />
          ) : null}
          {variant == "collection" ? (
            <IconButton
              onClick={(e) => handleAdd(e)}
              sx={{
                "&:focus": {
                  outline: "none",
                },
                p: 0.5,
              }}
            >
              <Add
                sx={{
                  fontSize: "15px",
                }}
              />
            </IconButton>
          ) : null}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </MuiAccordion>
  )
}
