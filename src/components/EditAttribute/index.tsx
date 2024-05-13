import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  IconButton,
  ListItem,
  Stack,
  Typography,
} from "@mui/material"

import { Add, Delete } from "@mui/icons-material"
import { TextField as MuiTextField } from "@mui/material"
import { useState } from "react"
import {
  ProjectAttribute,
  ProjectAttributes,
  setProject,
} from "../../slices/projects"
import { TaskAttributes } from "../../slices/tasks"
import { Dropdown } from "../Dropdown"

interface EditAttributeProps {
  attribute: ProjectAttribute
  taskAttributes: TaskAttributes
  setAttributes: React.Dispatch<React.SetStateAction<TaskAttributes>>
  setProjectAttributes: React.Dispatch<React.SetStateAction<ProjectAttributes>>
}

export function EditAttribute({
  attribute,
  taskAttributes,
  setAttributes,
  setProjectAttributes,
}: EditAttributeProps) {
  const [optionName, setOptionName] = useState<string>("")

  return (
    <Accordion
      elevation={3}
      sx={{
        "& .MuiAccordionSummary-root": {
          bgcolor: "white",
        },
        "& .MuiAccordionDetails-root": {
          bgcolor: "white",
        },
      }}
    >
      <AccordionSummary>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          width="100%"
          justifyContent="space-between"
        >
          <Typography variant="h6">{attribute.name}</Typography>
          <IconButton
            sx={{
              "&:focus": {
                outline: "none",
              },
            }}
            onClick={() => {
              setAttributes((prev) => {
                const newAttributes = { ...prev }
                delete newAttributes[attribute.name]
                return newAttributes
              })
              setProjectAttributes((prev) => {
                const newAttributes = { ...prev }
                delete newAttributes[attribute.name]
                return newAttributes
              })
            }}
          >
            <Delete />
          </IconButton>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            height="50px"
            spacing={3}
            alignSelf="flex-end"
          >
            <Typography variant="body1" width={70}>
              Wartość:
            </Typography>
            <Dropdown
              placeholder="Wybierz wartość"
              options={
                attribute.options
                  ? attribute.options.map((option) => {
                      return {
                        label: option,
                        value: option,
                      }
                    })
                  : []
              }
              value={taskAttributes[attribute.name]?.value || ""}
              onChange={(event) => {
                setAttributes((prev) => {
                  return {
                    ...prev,
                    [attribute.name]: {
                      ...attribute,
                      value: event.target.value,
                    },
                  }
                })
              }}
            />
          </Stack>
          <Stack spacing={1}>
            <Stack direction="row">
              <Typography variant="body1" lineHeight="50px">
                Opcje:
              </Typography>
            </Stack>
            <Stack sx={{ border: "1px solid black" }}>
              {attribute.options?.map((option) => (
                <ListItem>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    width="100%"
                    justifyContent="space-between"
                  >
                    <Typography variant="body1">{option}</Typography>
                    <IconButton
                      sx={{
                        alignSelf: "end",
                        "&:focus": {
                          outline: "none",
                        },
                      }}
                      onClick={() => {
                        setProjectAttributes((prev) => {
                          const newOptions = attribute.options?.filter(
                            (item) => item !== option,
                          )
                          return {
                            ...prev,
                            [attribute.name]: {
                              ...attribute,
                              options: newOptions,
                            },
                          }
                        })
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </ListItem>
              ))}
              <Divider />
              <ListItem>
                <Stack
                  direction="row"
                  width="100%"
                  justifyContent="space-between"
                >
                  <MuiTextField
                    placeholder="Dodaj opcję"
                    variant="standard"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    sx={{
                      "& input": {
                        minWidth: "100px",
                      },
                    }}
                  />
                  <IconButton
                    sx={{
                      alignSelf: "end",
                      "&:focus": {
                        outline: "none",
                      },
                    }}
                    onClick={() => {
                      setProjectAttributes((prev) => {
                        const newOptions = attribute.options
                          ? [...attribute.options, optionName]
                          : [optionName]
                        return {
                          ...prev,
                          [attribute.name]: {
                            ...attribute,
                            options: newOptions,
                          },
                        }
                      })
                      setOptionName("")
                    }}
                  >
                    <Add />
                  </IconButton>
                </Stack>
              </ListItem>
            </Stack>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
