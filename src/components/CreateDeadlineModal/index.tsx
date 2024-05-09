import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { collection, doc } from "firebase/firestore"
import { Form, Formik, FormikHelpers } from "formik"
import { firestore } from "../../../firebase.config"
import { deadlineModalSchema } from "../../../validationSchema"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { selectDeadline } from "../../selectors/deadlines"
import { addDeadlineStart, updateDeadlineStart } from "../../slices/deadlines"
import { Modal as ModalType } from "../DataPanel"
import { DateField } from "../DateField"
import { Modal } from "../Modal"
import { PrimaryButton } from "../PrimaryButton"
import { SecondaryButton } from "../SecondaryButton"
import { TextArea } from "../TextArea"
import { TextField } from "../TextField"

interface CreateDeadlineModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
  workspaceId: string
  projectId: string
  deadlineId: string | undefined
}

interface FormData {
  id: string
  title: string
  projectId: string
  workspaceId: string
  description: string
  date: number | null
}

const initialValues = {
  id: "",
  title: "",
  projectId: "",
  workspaceId: "",
  description: "",
  date: null,
}

export function CreateDeadlineModal({
  open,
  setModal,
  workspaceId,
  projectId,
  deadlineId,
}: CreateDeadlineModalProps) {
  const dispatch = useAppDispatch()

  const user = useAppSelector((state) => state.user.user)
  const deadline = useAppSelector((state) =>
    selectDeadline(state, projectId, deadlineId),
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
    const { date, ...rest } = values
    const quarterDate = new Date(2024, 1, 1, 0, 0)
    const yearDate = new Date(2024, 1, 1, 0, 0)
    const timestamp = date
    if (!timestamp) return
    while (timestamp >= quarterDate.getTime() + 7 * 24 * 60 * 60 * 1000) {
      quarterDate.setDate(quarterDate.getDate() + 7)
    }
    while (timestamp >= yearDate.getTime() + 30 * 24 * 60 * 60 * 1000) {
      yearDate.setMonth(yearDate.getMonth() + 1)
    }
    const weekTimestamp = quarterDate.getTime()
    const monthTimestamp = yearDate.getTime()

    try {
      if (!deadlineId) {
        if (workspaceId && projectId && user) {
          const id = doc(
            collection(
              firestore,
              `users/${user.id}/workspaces/${workspaceId}/deadlines`,
            ),
          ).id
          dispatch(
            addDeadlineStart({
              ...rest,
              id,
              projectId,
              workspaceId,
              timestamp: {
                day: timestamp,
                week: weekTimestamp,
                month: monthTimestamp,
              },
            }),
          )
        }
      } else {
        dispatch(
          updateDeadlineStart({
            data: {
              ...rest,
              workspaceId,
              projectId,
              timestamp: {
                day: timestamp,
                week: weekTimestamp,
                month: monthTimestamp,
              },
            },
            deadlineId,
            projectId,
            workspaceId,
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
      initialValues={
        deadline ? { ...deadline, date: deadline.timestamp.day } : initialValues
      }
      validationSchema={deadlineModalSchema}
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
                  <Typography variant="h6">Dodaj deadline</Typography>
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
                          icon={<DriveFileRenameOutlineIcon />}
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
                    <Stack
                      direction="row"
                      justifyContent="flex-start "
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1" width={100}>
                        Data
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <Box
                          position="absolute"
                          sx={{
                            transform: "translateX(-30px)",
                          }}
                        >
                          {errors.date && touched.date ? (
                            <Tooltip title="Data jest wymagana" arrow>
                              <PriorityHighIcon
                                color="error"
                                fontSize="large"
                              />
                            </Tooltip>
                          ) : null}
                        </Box>
                        <DateField
                          placeholder="Wybierz datę"
                          value={values.date}
                          setFieldValue={setFieldValue}
                          name="date"
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
                      label="Zapisz"
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
