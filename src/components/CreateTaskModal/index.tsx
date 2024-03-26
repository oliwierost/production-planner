import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import { Box, Stack, Tab, Tabs, Tooltip, Typography } from "@mui/material"
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
import { addTaskStart, taskId, updateTaskStart } from "../../slices/tasks"
import { useState } from "react"
import { setDragDisabled } from "../../slices/drag"
import { taskModalSchema } from "../../../validationSchema"
import { DateField } from "../DateField"
import { Dropdown } from "../Dropdown"
import { Modal as ModalType } from "../DataPanel"
import { selectFacilities } from "../../selectors/facilities"
import { selectTask, selectTasks } from "../../selectors/tasks"
import _ from "lodash"
import { ArrowRightAlt } from "@mui/icons-material"

interface CreateTaskModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
  taskId?: string
  projectId?: string
  workspaceId?: string
}

interface FormData {
  title: string
  description: string
  duration: number
  startTime: number | null
  facilityId: string | null
  bgcolor: string
  requiredTasks: string[]
  requiredByTasks: string[]
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
  requiredTasks: [] as taskId[],
  requiredByTasks: [] as taskId[],
}

export function CreateTaskModal({
  open,
  setModal,
  taskId,
  projectId,
  workspaceId,
}: CreateTaskModalProps) {
  const [tab, setTab] = useState(0)
  const [highlightedTaskId, setHighlightedTaskId] = useState<taskId>("")
  const tasks = useAppSelector((state) => selectTasks(state, projectId))
  const task = useAppSelector((state) => selectTask(state, taskId, projectId))
  const facilities = useAppSelector((state) =>
    selectFacilities(state, workspaceId),
  )
  const facilitiesOptions = Object.values(facilities ?? {}).map((facility) => ({
    label: facility.title,
    value: facility.id,
  }))
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user.user)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<FormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    setFieldValue(name, value)
  }

  const handleTabChange = (
    _: React.SyntheticEvent<Element, Event>,
    newValue: number,
  ) => {
    setTab(newValue)
  }

  const handleSubmit = async (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"],
  ) => {
    try {
      if (!task) {
        const id = doc(
          collection(
            firestore,
            `users/${user?.id}/workspaces/${workspaceId}/tasks`,
          ),
        ).id
        if (!projectId || !workspaceId) return
        dispatch(
          addTaskStart({
            task: {
              ...values,
              dropped: false,
              projectId: projectId,
              workspaceId: workspaceId,
              id,
            },
            workspaceId: workspaceId,
          }),
        )
      } else {
        if (!workspaceId) return
        dispatch(updateTaskStart({ task: task, data: values, workspaceId }))
      }
      setModal(null)
      resetForm()
      dispatch(setDragDisabled(false))
    } catch (error) {
      resetForm()
    }
  }

  const handleClose = (resetForm: FormikHelpers<FormData>["resetForm"]) => {
    setModal(null)
    resetForm()
    dispatch(setDragDisabled(false))
  }

  const tabs = [
    {
      label: "Informacje",
      value: 0,
    },
    {
      label: "Związki",
      value: 1,
    },
  ]

  return (
    <Formik
      initialValues={task ? task : initialValues}
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
                          {taskId && task?.dropped ? (
                            <Typography variant="body2" color="error">
                              Aby zmienić czas trwania, usuń zadanie z
                              harmonogramu
                            </Typography>
                          ) : null}
                          <Stack
                            direction="row"
                            spacing={5}
                            alignItems="center"
                          >
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
                                icon={
                                  <Typography fontWeight={600} fontSize="14px">
                                    [dni/os]
                                  </Typography>
                                }
                                value={values.duration}
                                onChange={(e) =>
                                  handleInputChange(e, setFieldValue)
                                }
                                name="duration"
                                disabled={
                                  taskId && task?.dropped ? true : false
                                }
                              />
                            </Stack>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={5}
                            alignItems="center"
                          >
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
                          <Stack
                            direction="row"
                            spacing={5}
                            alignItems="center"
                          >
                            <Typography variant="body1" width={100}>
                              Stanowisko
                            </Typography>
                            <Stack direction="row" alignItems="center">
                              <Dropdown
                                placeholder="Stanowisko"
                                value={values.facilityId || ""}
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
                      </>
                    ) : null}
                    {tab == 1 ? (
                      <>
                        <Stack spacing={2}>
                          <Typography variant="body1">
                            Dodaj zadania wymagane do rozpoczęcia tego zadania
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Stack
                              sx={{
                                border: "1px solid black",
                                width: "50%",
                                height: 300,
                                overflow: "auto",
                                p: 1,
                              }}
                            >
                              {tasks
                                ? Object.values(tasks)
                                    .filter(
                                      (task) =>
                                        !values.requiredTasks.includes(
                                          task.id,
                                        ) && task.id != taskId,
                                    )
                                    .map((task) => (
                                      <Typography
                                        variant="body1"
                                        key={task.id}
                                        pl={0.5}
                                        bgcolor={
                                          highlightedTaskId == task.id
                                            ? "grey.500"
                                            : "transparent"
                                        }
                                        color={
                                          highlightedTaskId == task.id
                                            ? "white"
                                            : "black"
                                        }
                                        onClick={() =>
                                          setHighlightedTaskId(task.id)
                                        }
                                      >
                                        {task.title}
                                      </Typography>
                                    ))
                                : null}
                            </Stack>
                            <Stack alignItems="center" spacing={1}>
                              <ArrowRightAlt fontSize="large" />
                              <PrimaryButton
                                onClick={() => {
                                  if (!highlightedTaskId) return
                                  if (
                                    !values.requiredTasks.includes(
                                      highlightedTaskId,
                                    )
                                  ) {
                                    setFieldValue("requiredTasks", [
                                      ...values.requiredTasks,
                                      highlightedTaskId,
                                    ])
                                  } else {
                                    const newRequiredTasks = [
                                      ...values.requiredTasks,
                                    ]
                                    newRequiredTasks.splice(
                                      newRequiredTasks.indexOf(
                                        highlightedTaskId,
                                      ),
                                      1,
                                    )
                                    setFieldValue(
                                      "requiredTasks",
                                      newRequiredTasks,
                                    )
                                  }
                                  setHighlightedTaskId("")
                                }}
                                label={
                                  values.requiredTasks.includes(
                                    highlightedTaskId,
                                  )
                                    ? "Usuń"
                                    : "Dodaj"
                                }
                                disabled={!highlightedTaskId}
                                sx={{
                                  textTransform: "none",
                                  padding: 0,
                                }}
                              />
                              <ArrowRightAlt
                                fontSize="large"
                                sx={{ transform: "rotate(180deg)" }}
                              />
                            </Stack>
                            <Stack
                              sx={{
                                border: "1px solid black",
                                width: "50%",
                                height: 300,
                                overflow: "auto",
                                p: 1,
                              }}
                            >
                              {values.requiredTasks
                                ? values.requiredTasks.map((taskId) => {
                                    const task = tasks?.[taskId]
                                    if (!task) return null
                                    return (
                                      <Typography
                                        variant="body1"
                                        key={taskId}
                                        pl={0.5}
                                        bgcolor={
                                          highlightedTaskId == taskId
                                            ? "grey.500"
                                            : "transparent"
                                        }
                                        color={
                                          highlightedTaskId == taskId
                                            ? "white"
                                            : "black"
                                        }
                                        onClick={() =>
                                          setHighlightedTaskId(taskId)
                                        }
                                      >
                                        {task.title}
                                      </Typography>
                                    )
                                  })
                                : null}
                            </Stack>
                          </Stack>
                        </Stack>
                      </>
                    ) : null}
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
              </Stack>
            </Modal>
          </Form>
        </>
      )}
    </Formik>
  )
}
