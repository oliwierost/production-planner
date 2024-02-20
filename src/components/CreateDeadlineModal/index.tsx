import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { TextField } from "../TextField"
import { Modal } from "../Modal"
import { TitleBar } from "../TitleBar"
import { TextArea } from "../TextArea"
import { SecondaryButton } from "../SecondaryButton"
import { PrimaryButton } from "../PrimaryButton"
import { doc, collection } from "firebase/firestore"
import { firestore } from "../../../firebase.config"
import { Form, Formik, FormikHelpers } from "formik"
import { DateField } from "../DateField"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { addDeadlineStart, updateDeadlineStart } from "../../slices/deadlines"
import { deadlineModalSchema } from "../../../validationSchema"
import { useEffect, useState } from "react"

interface CreateDeadlineModalProps {
  open: boolean
  deadlineId: string
  setOpen: React.Dispatch<React.SetStateAction<string | null>>
}

interface FormData {
  id: string
  title: string
  description: string
  date: Date
}

const initialValues = {
  id: "",
  title: "",
  description: "",
  date: new Date(),
}

export function CreateDeadlineModal({
  open,
  setOpen,
  deadlineId,
}: CreateDeadlineModalProps) {
  const [deadline, setDeadline] = useState<FormData>(initialValues)
  const deadlines = useAppSelector((state) => state.deadlines.deadlines)
  const dispatch = useAppDispatch()
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
    const timestamp = date.getTime()
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
        const newDeadline = doc(collection(firestore, "deadlines"))
        dispatch(
          addDeadlineStart({
            ...rest,
            id: newDeadline.id,
            timestamp: {
              day: timestamp,
              week: weekTimestamp,
              month: monthTimestamp,
            },
          }),
        )
      } else {
        dispatch(
          updateDeadlineStart({
            id: deadlineId,
            data: {
              ...rest,
              timestamp: {
                day: timestamp,
                week: weekTimestamp,
                month: monthTimestamp,
              },
            },
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

  useEffect(() => {
    if (deadlineId) {
      const deadline = deadlines[deadlineId]
      const { timestamp, ...rest } = deadline
      const formDeadline = {
        ...rest,
        date: new Date(timestamp.day),
      }
      setDeadline(formDeadline)
    }
  }, [deadlineId, deadlines])
  return (
    <Formik
      initialValues={deadline}
      validationSchema={deadlineModalSchema}
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
                    {deadlineId ? "Edytuj" : "Dodaj"} deadline
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
                      label={deadlineId ? "Zapisz" : "Dodaj"}
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
