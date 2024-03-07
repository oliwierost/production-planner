import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
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
import { ColorField } from "../ColorField"
import { NumberField } from "../NumberField"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { Task, addTaskStart, updateTaskStart } from "../../slices/tasks"
import { useEffect, useState } from "react"
import { setDragDisabled } from "../../slices/drag"
import { taskModalSchema } from "../../../validationSchema"
import { DateField } from "../DateField"
import { Dropdown } from "../Dropdown"

interface CreateTaskModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<string | null>>
  taskId?: string
}

interface FormData {
  title: string
  description: string
  duration: number
  startTime: number | null
  facilityId: string | null
  bgcolor: string
}

const colorOptions = [
  {
    bgcolor: "#6ab1f7",
    color: "#FFFFFF",
  },
  {
    bgcolor: "#FF4500",
    color: "#000000",
  },
  {
    bgcolor: "#27ae60",
    color: "#000000",
  },
  {
    bgcolor: "#f39c12",
    color: "#000000",
  },
  {
    bgcolor: "#8e44ad",
    color: "#000000",
  },
]

const initialValues = {
  id: "",
  title: "",
  dropped: false,
  description: "",
  duration: 1,
  startTime: null,
  facilityId: null,
  bgcolor: "",
  projectId: "",
}

export function CreateTaskModal({
  open,
  setOpen,
  taskId,
}: CreateTaskModalProps) {
  const [task, setTask] = useState<Task>(initialValues)
  const tasks = useAppSelector((state) => state.tasks.tasks)
  const selectedProject = useAppSelector(
    (state) => state.projects.selectedProject,
  )
  const selectedWorkspace = useAppSelector(
    (state) => state.workspaces.selectedWorkspace,
  )
  const facilities = useAppSelector((state) => state.facilities.facilities)
  const facilitiesOptions = Object.values(facilities).map((facility) => ({
    label: facility.title,
    value: facility.id,
  }))
  const dispatch = useAppDispatch()
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<FormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    setFieldValue(name, value)
  }

  useEffect(() => {
    if (taskId) {
      const task = tasks[taskId]
      setTask(task)
    }
  }, [taskId, tasks])

  const handleSubmit = async (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"],
  ) => {
    try {
      if (!taskId) {
        const id = doc(
          collection(
            firestore,
            `users/first-user/workspaces/${selectedWorkspace}/tasks`,
          ),
        ).id
        if (selectedProject && selectedWorkspace) {
          dispatch(
            addTaskStart({
              task: {
                ...values,
                dropped: false,
                projectId: selectedProject,
                id,
              },
              workspaceId: selectedWorkspace,
            }),
          )
        }
      } else {
        dispatch(updateTaskStart({ id: task.id, data: values }))
      }
      setOpen(null)
      resetForm()
      dispatch(setDragDisabled(false))
    } catch (error) {
      resetForm()
    }
  }

  const handleClose = (resetForm: FormikHelpers<FormData>["resetForm"]) => {
    setOpen(null)
    resetForm()
    dispatch(setDragDisabled(false))
  }

  return (
    <Formik
      initialValues={task}
      validationSchema={taskModalSchema}
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
                    {taskId ? "Edytuj" : "Dodaj"} zadanie
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
                    {taskId && task.dropped ? (
                      <Typography variant="body2" color="error">
                        Aby zmienić czas trwania, usuń zadanie z harmonogramu
                      </Typography>
                    ) : null}
                    <Stack direction="row" spacing={5} alignItems="center">
                      <Typography variant="body1" width={100}>
                        Czas trwania
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <Box
                          position="absolute"
                          sx={{
                            transform: "translateX(-30px)",
                          }}
                        >
                          {errors.duration && touched.duration ? (
                            <Tooltip title={errors.duration} arrow>
                              <PriorityHighIcon
                                color="error"
                                fontSize="large"
                              />
                            </Tooltip>
                          ) : null}
                        </Box>
                        <NumberField
                          placeholder="Czas"
                          icon={<Typography fontWeight={600}>[dni]</Typography>}
                          value={values.duration}
                          onChange={(e) => handleInputChange(e, setFieldValue)}
                          name="duration"
                          disabled={taskId && task.dropped ? true : false}
                        />
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={5} alignItems="center">
                      <Typography variant="body1" width={100}>
                        Data rozpoczęcia*
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <DateField
                          placeholder="Data rozpoczęcia"
                          value={values.startTime}
                          setFieldValue={setFieldValue}
                          name="startTime"
                        />
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={5} alignItems="center">
                      <Typography variant="body1" width={100}>
                        Stanowisko
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <Dropdown
                          placeholder="Stanowisko"
                          value={facilities[values.facilityId!]?.title || ""}
                          setFieldValue={setFieldValue}
                          name="facilityId"
                          options={facilitiesOptions}
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
                      label={taskId ? "Zapisz" : "Dodaj"}
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
