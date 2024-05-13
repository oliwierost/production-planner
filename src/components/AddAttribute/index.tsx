import { IconButton, Stack, Typography } from "@mui/material"

import { Add, DriveFileRenameOutline } from "@mui/icons-material"
import { useState } from "react"
import { ProjectAttributes } from "../../slices/projects"
import { TaskAttributes } from "../../slices/tasks"
import { TextField } from "../TextField"

interface AddAttributeProps {
  setAttributes: React.Dispatch<React.SetStateAction<TaskAttributes>>
  setProjectAttributes: React.Dispatch<React.SetStateAction<ProjectAttributes>>
}

export function AddAttribute({
  setAttributes,
  setProjectAttributes,
}: AddAttributeProps) {
  const [attributeName, setAttributeName] = useState<string>("")
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Stack justifyContent="space-between" width="100%">
        <Stack
          direction="row"
          alignItems="center"
          height="50px"
          spacing={3}
          justifyContent="space-between"
          width="100%"
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography variant="body1" width={70}>
              Nazwa
            </Typography>
            <TextField
              placeholder="Dodaj"
              icon={<DriveFileRenameOutline />}
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
            />
          </Stack>
          <IconButton
            sx={{
              "&:focus": {
                outline: "none",
              },
            }}
            onClick={() => {
              setAttributes((prev) => {
                if (prev[attributeName]) {
                  return prev
                } else {
                  return {
                    ...prev,
                    [attributeName]: {
                      name: attributeName,
                    },
                  }
                }
              })
              setProjectAttributes((prev) => {
                if (prev[attributeName]) {
                  return prev
                } else {
                  return {
                    ...prev,
                    [attributeName]: {
                      name: attributeName,
                    },
                  }
                }
              })
              setAttributeName("")
            }}
          >
            <Add />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  )
}
