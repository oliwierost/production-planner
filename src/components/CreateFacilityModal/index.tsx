import { Add, Delete, DriveFileRenameOutline } from "@mui/icons-material"
import GroupsIcon from "@mui/icons-material/Groups"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import {
  Box,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material"
import { collection, doc } from "firebase/firestore"
import { Form, Formik, FormikHelpers } from "formik"
import { useEffect, useState } from "react"
import { firestore } from "../../../firebase.config"
import { facilityModalSchema } from "../../../validationSchema"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { selectFacility } from "../../selectors/facilities"
import { selectWorkspace } from "../../selectors/workspaces"
import {
  addFacilityStart,
  Attributes,
  Condition,
  Conditions,
  updateFacilityStart,
} from "../../slices/facilities"
import { ParentAttributes } from "../../slices/workspaces"
import { AddAttribute } from "../AddAttribute"
import { ColorField } from "../ColorField"
import { Modal as ModalType } from "../DataPanel"
import { EditAttribute } from "../EditAttribute"
import { Modal } from "../Modal"
import { NumberField } from "../NumberField"
import { PrimaryButton } from "../PrimaryButton"
import { SecondaryButton } from "../SecondaryButton"
import { TextArea } from "../TextArea"
import { TextField } from "../TextField"
import { Dropdown } from "../Dropdown"
import { selectProject } from "../../selectors/projects"
import { projectId } from "../../slices/projects"

interface CreateFacilityModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
  facilityId?: string
  workspaceId: string
}

interface FormData {
  title: string
  description: string
  manpower: number
  bgcolor: string
}

const initialValues = {
  id: "",
  tasks: [],
  title: "",
  description: "",
  manpower: 1,
  bgcolor: "",
}

const tabs = [
  {
    label: "Informacje",
    value: 0,
  },
  {
    label: "Atrybuty",
    value: 1,
  },
  {
    label: "Warunki",
    value: 2,
  },
]

const operatorOptions = [
  {
    label: "=",
    value: "==",
  },
  {
    label: "≠",
    value: "!=",
  },
]

const colorOptions = [
  {
    bgcolor: "#aec6cf",
    color: "#000000",
  },
  {
    bgcolor: "#a3d3a4",
    color: "#000000",
  },
  {
    bgcolor: "#f0e68c",
    color: "#000000",
  },
  {
    bgcolor: "#ffb347",
    color: "#000000",
  },
  {
    bgcolor: "#b19cd9",
    color: "#000000",
  },
]

export function CreateFacilityModal({
  open,
  setModal,
  facilityId,
  workspaceId,
}: CreateFacilityModalProps) {
  const [tab, setTab] = useState(0)
  const [condition, setCondition] = useState<Condition>({
    facilityAttribute: "",
    operator: "==",
    taskAttribute: "",
  })
  const [conditions, setConditions] = useState<Conditions>({})
  const [selectedProjectId, setSelectedProjectId] = useState<projectId>("")
  const dispatch = useAppDispatch()

  const workspace = useAppSelector((state) =>
    selectWorkspace(state, workspaceId),
  )
  const projects = useAppSelector(
    (state) => state.projects.projects[workspaceId],
  )

  const project = useAppSelector((state) =>
    selectProject(state, workspaceId, selectedProjectId),
  )
  const [workspaceAttributes, setWorkspaceAttributes] =
    useState<ParentAttributes>({})
  const [attributes, setAttributes] = useState<Attributes>({})

  const user = useAppSelector((state) => state.user.user)

  const facility = useAppSelector((state) =>
    selectFacility(state, workspaceId, facilityId),
  )

  const handleTabChange = (
    _: React.SyntheticEvent<Element, Event>,
    newValue: number,
  ) => {
    setTab(newValue)
  }

  useEffect(() => {
    if (facility && facility.attributes) {
      setAttributes(facility.attributes)
    }
    if (workspace && workspace.facilityAttributes) {
      setWorkspaceAttributes(workspace.facilityAttributes)
    }
  }, [facility, workspace])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<FormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    setFieldValue(name, value)
  }

  const handleSubmit = async (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"],
  ) => {
    try {
      if (!facility) {
        const id = doc(
          collection(
            firestore,
            `users/${user}/workspaces/${workspaceId}/faciltiies`,
          ),
        ).id
        dispatch(
          addFacilityStart({
            facility: {
              ...values,
              id,
              workspaceId,
              tasks: [],
              attributes,
            },
            workspaceAttributes,
          }),
        )
      } else {
        dispatch(
          updateFacilityStart({
            facility: facility,
            data: {
              ...values,
              attributes,
            },
            workspaceAttributes,
          }),
        )
      }
      setModal(null)
      resetForm()
    } catch (error) {
      resetForm()
    }
  }

  const handleClose = (resetForm: FormikHelpers<FormData>["resetForm"]) => {
    setModal(null)
    resetForm()
  }
  console.log(conditions)
  return (
    <Formik
      initialValues={facility ? facility : initialValues}
      validationSchema={facilityModalSchema}
      enableReinitialize
      onSubmit={(values: FormData, { resetForm }) =>
        handleSubmit(values, resetForm)
      }
    >
      {({
        values,
        handleSubmit,
        setFieldValue,
        resetForm,
        errors,
        touched,
      }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <Modal open={open} onClose={() => handleClose(resetForm)}>
              <Stack alignItems="center" justifyContent="center">
                <Stack p={2} bgcolor="white" width="fit-content" spacing={4}>
                  <Typography variant="h6">
                    {facilityId ? "Edytuj" : "Dodaj"} stanowisko
                  </Typography>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                      value={tab}
                      onChange={handleTabChange}
                      aria-label="basic tabs example"
                    >
                      {tabs.map((tab) => (
                        <Tab
                          label={tab.label}
                          value={tab.value}
                          key={tab.value}
                          sx={{
                            ":focus": {
                              outline: "none",
                            },
                            textTransform: "none",
                          }}
                        />
                      ))}
                    </Tabs>
                  </Box>
                  <Stack spacing={2}>
                    {tab === 0 ? (
                      <>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={5}
                          alignItems="center"
                        >
                          <Typography variant="body1">Nazwa</Typography>
                          <Stack direction="row" alignItems="center">
                            <Box
                              position="absolute"
                              sx={{
                                transform: "translateX(-30px)",
                              }}
                            >
                              {errors.title && touched.title ? (
                                <Tooltip title={errors.title} arrow>
                                  <PriorityHighIcon
                                    color="error"
                                    fontSize="large"
                                  />
                                </Tooltip>
                              ) : null}
                            </Box>
                            <TextField
                              placeholder="Nazwa"
                              icon={<DriveFileRenameOutline />}
                              value={values.title}
                              onChange={(e) =>
                                handleInputChange(e, setFieldValue)
                              }
                              name="title"
                            />
                          </Stack>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={5}
                        >
                          <Typography variant="body1">Opis*</Typography>
                          <TextArea
                            placeholder="Opis"
                            value={values.description}
                            onChange={(e) =>
                              handleInputChange(e, setFieldValue)
                            }
                            name="description"
                          />
                        </Stack>
                        {facilityId && facility && facility.tasks.length > 0 ? (
                          <Typography variant="body2" color="error">
                            Aby zmienić siłę roboczą, usuń wszystkie zadania ze
                            stanowiska.
                          </Typography>
                        ) : null}
                        <Stack direction="row" spacing={5} alignItems="center">
                          <Typography variant="body1" width={100}>
                            Siła robocza
                          </Typography>
                          <Stack direction="row" alignItems="center">
                            <Box
                              position="absolute"
                              sx={{
                                transform: "translateX(-30px)",
                              }}
                            >
                              {errors.manpower && touched.manpower ? (
                                <Tooltip title={errors.manpower} arrow>
                                  <PriorityHighIcon
                                    color="error"
                                    fontSize="large"
                                  />
                                </Tooltip>
                              ) : null}
                            </Box>
                            <NumberField
                              placeholder="ilość osób"
                              icon={<GroupsIcon />}
                              value={values.manpower}
                              onChange={(e) =>
                                handleInputChange(e, setFieldValue)
                              }
                              name="manpower"
                              disabled={
                                facility && facility.tasks.length > 0
                                  ? true
                                  : false
                              }
                            />
                          </Stack>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={5}
                          alignItems="center"
                        >
                          <Typography variant="body1" width={100}>
                            Kolor
                          </Typography>
                          <Stack direction="row" alignItems="center">
                            <Box
                              position="absolute"
                              sx={{
                                transform: "translateX(-30px)",
                              }}
                            >
                              {errors.bgcolor && touched.bgcolor ? (
                                <Tooltip title={errors.bgcolor} arrow>
                                  <PriorityHighIcon
                                    color="error"
                                    fontSize="large"
                                  />
                                </Tooltip>
                              ) : null}
                            </Box>
                            <ColorField
                              value={values.bgcolor}
                              setFieldValue={setFieldValue}
                              name="bgcolor"
                              colorOptions={colorOptions}
                            />
                          </Stack>
                        </Stack>
                      </>
                    ) : null}
                    {tab == 1 ? (
                      <>
                        <Stack spacing={2} overflow="scroll" maxHeight={400}>
                          <Typography variant="body1">Dodaj atrybut</Typography>
                          <AddAttribute
                            setAttributes={setAttributes}
                            setParentAttributes={setWorkspaceAttributes}
                          />
                          <Divider />
                          <Typography variant="body1">
                            Edytuj atrybuty
                          </Typography>
                          <Stack>
                            {Object.values(workspaceAttributes).map(
                              (attribute, index) => (
                                <EditAttribute
                                  key={index}
                                  attribute={attribute}
                                  attributes={attributes}
                                  setAttributes={setAttributes}
                                  setParentAttributes={setWorkspaceAttributes}
                                />
                              ),
                            )}
                          </Stack>
                          <Divider />
                        </Stack>
                      </>
                    ) : null}
                    {tab == 2 ? (
                      <>
                        <Stack spacing={2} overflow="scroll" maxHeight={400}>
                          <Typography variant="body1">
                            Wybierz projekt
                          </Typography>
                          <Dropdown
                            width={180}
                            placeholder="Wybierz projekt"
                            options={Object.values(projects).map((project) => ({
                              label: project.title,
                              value: project.id,
                            }))}
                            onChange={(e) => {
                              setSelectedProjectId(e.target.value)
                            }}
                          />
                          <Typography variant="body1">Dodaj warunek</Typography>
                          <Stack direction="row" spacing={2}>
                            <Stack>
                              <Typography variant="body2">
                                Atrybut stanowiska
                              </Typography>
                              <Dropdown
                                width={180}
                                onChange={(e) => {
                                  setCondition((prev) => ({
                                    ...prev,
                                    facilityAttribute: e.target.value,
                                  }))
                                }}
                                options={Object.values(workspaceAttributes).map(
                                  (attribute) => ({
                                    label: attribute.name,
                                    value: attribute.name,
                                  }),
                                )}
                                placeholder="Atrybut A"
                                value={condition.facilityAttribute}
                              />
                            </Stack>
                            <Stack>
                              <Typography variant="body2">Operator</Typography>
                              <Dropdown
                                onChange={(e) => {
                                  setCondition((prev) => ({
                                    ...prev,
                                    operator: e.target.value,
                                  }))
                                }}
                                options={operatorOptions}
                                placeholder="Operator"
                                width={100}
                                value={condition.operator}
                              />
                            </Stack>
                            <Stack>
                              <Typography variant="body2">
                                Atrybut zadania
                              </Typography>
                              <Dropdown
                                onChange={(e) => {
                                  setCondition((prev) => ({
                                    ...prev,
                                    taskAttribute: e.target.value,
                                  }))
                                }}
                                width={180}
                                options={Object.values(
                                  project?.taskAttributes || {},
                                ).map((attribute) => ({
                                  label: attribute.name,
                                  value: attribute.name,
                                }))}
                                placeholder="Atrybut B"
                                value={condition.taskAttribute}
                              />
                            </Stack>
                            <IconButton
                              sx={{
                                alignSelf: "flex-end",
                                height: 45,
                                width: 45,
                                "&:focus": {
                                  outline: "none",
                                },
                              }}
                              onClick={() => {
                                if (
                                  condition.facilityAttribute &&
                                  condition.operator &&
                                  condition.taskAttribute
                                ) {
                                  setConditions((prev) => {
                                    return {
                                      ...prev,
                                      [selectedProjectId]: [
                                        ...(prev[selectedProjectId] || []),
                                        {
                                          facilityAttribute:
                                            condition.facilityAttribute,

                                          operator: condition.operator,
                                          taskAttribute:
                                            condition.taskAttribute,
                                        },
                                      ],
                                    }
                                  })
                                  setCondition({
                                    facilityAttribute: "",
                                    operator: "",
                                    taskAttribute: "",
                                  })
                                }
                              }}
                            >
                              <Add />
                            </IconButton>
                          </Stack>
                          <Divider />
                          <Typography variant="body1">
                            Edytuj warunki
                          </Typography>
                          <Stack spacing={3}>
                            {conditions[selectedProjectId]
                              ? conditions[selectedProjectId].map(
                                  (condition, index) => (
                                    <Stack
                                      key={index}
                                      direction="row"
                                      justifyContent="space-between"
                                      alignItems="center"
                                    >
                                      <Stack direction="row" spacing={4}>
                                        <Stack
                                          alignItems="center"
                                          justifyContent="center"
                                        >
                                          <Typography
                                            variant="body1"
                                            fontWeight={600}
                                          >
                                            {index + 1}.
                                          </Typography>
                                        </Stack>
                                        <Stack>
                                          <Typography variant="body2">
                                            Atrybut stanowiska
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            fontWeight={600}
                                          >
                                            {condition.facilityAttribute}
                                          </Typography>
                                        </Stack>
                                        <Stack>
                                          <Typography variant="body2">
                                            Operator
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            fontWeight={600}
                                          >
                                            {condition.operator == "=="
                                              ? "="
                                              : "≠"}
                                          </Typography>
                                        </Stack>
                                        <Stack>
                                          <Typography variant="body2">
                                            Atrybut zadania
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            fontWeight={600}
                                          >
                                            {condition.taskAttribute}
                                          </Typography>
                                        </Stack>
                                      </Stack>
                                      <IconButton
                                        sx={{
                                          "&:focus": {
                                            outline: "none",
                                          },
                                        }}
                                        onClick={() => {
                                          setConditions((prev) => {
                                            return {
                                              ...prev,
                                              [selectedProjectId]: prev[
                                                selectedProjectId
                                              ].filter((_, i) => i !== index),
                                            }
                                          })
                                        }}
                                      >
                                        <Delete />
                                      </IconButton>
                                    </Stack>
                                  ),
                                )
                              : null}
                          </Stack>
                          <Divider />
                        </Stack>
                      </>
                    ) : null}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={5}
                  >
                    <SecondaryButton
                      onClick={() => handleClose(resetForm)}
                      label="Anuluj"
                    />
                    <PrimaryButton
                      type="submit"
                      onClick={() => handleSubmit()}
                      label={facilityId ? "Zapisz" : "Dodaj"}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Modal>
          </Form>
        </>
      )}
    </Formik>
  )
}
