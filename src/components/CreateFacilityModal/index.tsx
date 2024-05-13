import { DriveFileRenameOutline } from "@mui/icons-material"
import GroupsIcon from "@mui/icons-material/Groups"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import {
  Box,
  Divider,
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

  const dispatch = useAppDispatch()

  const workspace = useAppSelector((state) =>
    selectWorkspace(state, workspaceId),
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
