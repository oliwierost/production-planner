import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { Modal } from "../Modal"
import { TitleBar } from "../TitleBar"
import { TextArea } from "../TextArea"
import { SecondaryButton } from "../SecondaryButton"
import { PrimaryButton } from "../PrimaryButton"
import { doc, collection } from "firebase/firestore"
import { firestore } from "../../../firebase.config"
import { Form, Formik, FormikHelpers } from "formik"
import { Dropdown } from "../Dropdown"
import { ColorField } from "../ColorField"
import { NumberField } from "../NumberField"
import { useAppDispatch, useAppSelector } from "../../hooks"
import {
  Facility,
  addFacilityStart,
  updateFacilityStart,
} from "../../slices/facilities"
import GroupsIcon from "@mui/icons-material/Groups"
import { useEffect, useState } from "react"
import { facilityModalSchema } from "../../../validationSchema"

interface CreateFacilityModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<string | null>>
  facilityId?: string
}

interface FormData {
  location: string
  activity: string
  description: string
  manpower: number
  bgcolor: string
}

const initialValues = {
  id: "",
  tasks: [],
  title: "",
  location: "",
  activity: "",
  description: "",
  manpower: 1,
  bgcolor: "",
}

const locations = [
  { value: "BOP_GA", label: "BOP_GA" },
  { value: "BOP_GD", label: "BOP_GD" },
]

const activities = [
  { value: "CUTTING", label: "CUTTING" },
  { value: "PREFABRICATION", label: "PREFABRICATION" },
  { value: "TRANSPORT", label: "TRANSPORT" },
  { value: "ASSEMBLY", label: "ASSEMBLY" },
  { value: "QUALITY CONTROL", label: "QUALITY CONTROL" },
  { value: "PAINTING", label: "PAINTING" },
  { value: "INSTALLATION", label: "INSTALLATION" },
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
  setOpen,
  facilityId,
}: CreateFacilityModalProps) {
  const [facility, setFacility] = useState<Facility>(initialValues)
  const dispatch = useAppDispatch()
  const facilities = useAppSelector((state) => state.facilities.facilities)
  const selectedWorkspace = useAppSelector(
    (state) => state.workspaces.selectedWorkspace,
  )
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<FormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    setFieldValue(name, value)
  }

  useEffect(() => {
    if (facilityId) {
      const facility = facilities[facilityId]
      setFacility(facility)
    }
  }, [facilityId, facilities])

  const handleSubmit = async (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"],
  ) => {
    try {
      if (!facilityId) {
        const id = doc(
          collection(
            firestore,
            `users/first-user/workspaces/${selectedWorkspace}/faciltiies`,
          ),
        ).id
        dispatch(
          addFacilityStart({
            ...values,
            id: id,
            title: values.location + " " + values.activity,
            tasks: [],
          }),
        )
      } else {
        dispatch(
          updateFacilityStart({
            id: facility.id,
            data: { ...values, title: values.location + " " + values.activity },
          }),
        )
      }
      setOpen(null)
      resetForm()
    } catch (error) {
      resetForm()
    }
  }

  const handleClose = (resetForm: FormikHelpers<FormData>["resetForm"]) => {
    setOpen(null)
    resetForm()
  }
  return (
    <Formik
      initialValues={facility}
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
                <TitleBar onClose={() => handleClose(resetForm)} />
                <Stack p={2} bgcolor="white" width="fit-content" spacing={4}>
                  <Typography variant="h6">
                    {facilityId ? "Edytuj" : "Dodaj"} stanowisko
                  </Typography>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Lokalizacja</Typography>
                      <Stack direction="row" alignItems="center">
                        <Box
                          position="absolute"
                          sx={{
                            transform: "translateX(-30px)",
                          }}
                        >
                          {errors.location && touched.location ? (
                            <Tooltip title={errors.location} arrow>
                              <PriorityHighIcon
                                color="error"
                                fontSize="large"
                              />
                            </Tooltip>
                          ) : null}
                        </Box>
                        <Dropdown
                          options={locations}
                          placeholder="Wybierz lokalizacje"
                          value={values.location}
                          setFieldValue={setFieldValue}
                          name="location"
                        />
                      </Stack>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Czynność</Typography>
                      <Stack direction="row" alignItems="center">
                        <Box
                          position="absolute"
                          sx={{
                            transform: "translateX(-30px)",
                          }}
                        >
                          {errors.activity && touched.activity ? (
                            <Tooltip title={errors.activity} arrow>
                              <PriorityHighIcon
                                color="error"
                                fontSize="large"
                              />
                            </Tooltip>
                          ) : null}
                        </Box>
                        <Dropdown
                          options={activities}
                          placeholder="Wybierz czynność"
                          value={values.activity}
                          setFieldValue={setFieldValue}
                          name="activity"
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
                        onChange={(e) => handleInputChange(e, setFieldValue)}
                        name="description"
                      />
                    </Stack>
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
                          onChange={(e) => handleInputChange(e, setFieldValue)}
                          name="manpower"
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
