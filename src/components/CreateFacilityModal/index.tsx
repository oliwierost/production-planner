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
import { ColorField } from "../ColorField"
import { NumberField } from "../NumberField"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { addFacilityStart, updateFacilityStart } from "../../slices/facilities"
import GroupsIcon from "@mui/icons-material/Groups"
import { facilityModalSchema } from "../../../validationSchema"
import { Modal as ModalType } from "../DataPanel"
import { selectFacility } from "../../selectors/facilities"
import { TextField } from "../TextField"
import { DriveFileRenameOutline } from "@mui/icons-material"

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
  const dispatch = useAppDispatch()

  const user = useAppSelector((state) => state.user.user)

  const facility = useAppSelector((state) =>
    selectFacility(state, workspaceId, facilityId),
  )
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
            ...values,
            id,
            workspaceId,
            tasks: [],
          }),
        )
      } else {
        dispatch(
          updateFacilityStart({
            facility: facility,
            data: { ...values },
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
                          onChange={(e) => handleInputChange(e, setFieldValue)}
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
                        onChange={(e) => handleInputChange(e, setFieldValue)}
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
                          onChange={(e) => handleInputChange(e, setFieldValue)}
                          name="manpower"
                          disabled={
                            facility && facility.tasks.length > 0 ? true : false
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
