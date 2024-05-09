import {
  DriveFileRenameOutline,
  Percent,
  PriorityHigh,
  TrendingDown,
  TrendingUp,
} from "@mui/icons-material"
import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { collection, doc } from "firebase/firestore"
import "firebase/functions"
import { Form, Formik, FormikHelpers } from "formik"
import { firestore } from "../../../firebase.config"
import { raportModalSchema } from "../../../validationSchema"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { selectProject } from "../../selectors/projects"
import { selectRaports } from "../../selectors/raports"
import { selectTask } from "../../selectors/tasks"
import { setDragDisabled } from "../../slices/drag"
import { inviteId } from "../../slices/invites"
import { projectId } from "../../slices/projects"
import { raportId, upsertRaportStart } from "../../slices/raports"
import { taskId } from "../../slices/tasks"
import { userId } from "../../slices/user"
import { workspaceId } from "../../slices/workspaces"
import { Modal as ModalType } from "../DataPanel"
import { Modal } from "../Modal"
import { NumberField } from "../NumberField"
import { PrimaryButton } from "../PrimaryButton"
import { Raport } from "../Raport"
import { SecondaryButton } from "../SecondaryButton"
import { TextArea } from "../TextArea"
import { TextField } from "../TextField"

interface RaportModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
  workspaceId: workspaceId
  projectId: projectId
  inviteId: inviteId | undefined
  taskId: taskId | undefined
}

export interface RaportFormData {
  id: raportId
  title: string
  comment: string
  prevProgress: number
  progress: number
  workspaceId: workspaceId
  projectId: projectId
  taskId: taskId
  raportingUserId: userId
  raportingUserEmail: string
  inviteId?: inviteId
  createdAt: number
}

export function RaportModal({
  open,
  setModal,
  workspaceId,
  projectId,
  taskId,
}: RaportModalProps) {
  const dispatch = useAppDispatch()

  const raports = useAppSelector((state) => selectRaports(state, taskId))
  const project = useAppSelector((state) =>
    selectProject(state, workspaceId, projectId),
  )
  const userId = project?.ownerId
  const currentUser = useAppSelector((state) => state.user.user)
  const task = useAppSelector((state) => selectTask(state, taskId, projectId))

  const initialValues: RaportFormData = {
    id: "",
    title: "",
    comment: "",
    prevProgress: 0,
    progress: task ? task.progress : 0,
    workspaceId: "",
    projectId: "",
    taskId: "",
    raportingUserId: "",
    raportingUserEmail: "",
    inviteId: "",
    createdAt: new Date().getDate(),
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<RaportFormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    setFieldValue(name, value)
  }

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<RaportFormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    if (Number(value) < 0) {
      setFieldValue(name, 0)
    } else if (Number(value) > 100) {
      setFieldValue(name, 100)
    } else {
      setFieldValue(name, value)
    }
  }

  const handleSubmit = async (
    values: RaportFormData,
    resetForm: FormikHelpers<RaportFormData>["resetForm"],
  ) => {
    const id = doc(
      collection(
        firestore,
        `users/${userId}/workspaces/${workspaceId}/raports`,
      ),
    ).id
    if (!projectId || !workspaceId || !taskId || !currentUser) return
    dispatch(
      upsertRaportStart({
        raport: {
          ...values,
          projectId: projectId,
          workspaceId: workspaceId,
          taskId: taskId,
          raportingUserId: currentUser.id,
          raportingUserEmail: currentUser.email,
          id,
        },
        resetForm: resetForm,
        setModal: setModal,
      }),
    )
  }

  const handleClose = (
    resetForm: FormikHelpers<RaportFormData>["resetForm"],
  ) => {
    resetForm()
    setModal(null)
    dispatch(setDragDisabled(false))
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={raportModalSchema}
      enableReinitialize
      onSubmit={(values: RaportFormData, { resetForm }) =>
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
              <Stack
                alignItems="center"
                justifyContent="center"
                bgcolor="white"
                maxHeight={500}
              >
                <Stack
                  direction="row"
                  height="100%"
                  sx={{ overflowY: "hidden" }}
                >
                  {raports ? (
                    <Stack borderRight="1px solid black" overflow="scroll">
                      {Object.values(raports)
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((raport) => (
                          <Raport raport={raport} />
                        ))}
                    </Stack>
                  ) : null}
                  <Stack p={2} width="fit-content" spacing={4}>
                    <Typography variant="h6">Zdaj raport</Typography>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                        alignItems="center"
                      >
                        <Typography variant="body1">Tytuł</Typography>
                        <Stack direction="row" alignItems="center">
                          <Box
                            position="absolute"
                            sx={{
                              transform: "translateX(-30px)",
                            }}
                          >
                            {errors.title && touched.title ? (
                              <Tooltip title={errors.title} arrow>
                                <PriorityHigh color="error" fontSize="large" />
                              </Tooltip>
                            ) : null}
                          </Box>
                          <TextField
                            placeholder="Tytuł"
                            icon={<DriveFileRenameOutline />}
                            value={values.title}
                            onChange={(e) =>
                              handleInputChange(e, setFieldValue)
                            }
                            name="title"
                          />
                        </Stack>
                      </Stack>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={5}
                          alignItems="center"
                        >
                          <Typography variant="body1">Komentarz</Typography>
                          <Stack direction="row" alignItems="center">
                            <Box
                              position="absolute"
                              sx={{
                                transform: "translateX(-30px)",
                              }}
                            >
                              {errors.comment && touched.comment ? (
                                <Tooltip title={errors.comment} arrow>
                                  <PriorityHigh
                                    color="error"
                                    fontSize="large"
                                  />
                                </Tooltip>
                              ) : null}
                            </Box>
                            <TextArea
                              placeholder="Komentarz"
                              value={values.comment}
                              onChange={(e) =>
                                handleInputChange(e, setFieldValue)
                              }
                              name="comment"
                            />
                          </Stack>
                        </Stack>
                      </Stack>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={5}
                          alignItems="center"
                        >
                          <Typography variant="body1">
                            Stopień zaawansowania
                          </Typography>
                          <Stack direction="row" alignItems="center">
                            <Box
                              position="absolute"
                              sx={{
                                transform: "translateX(-30px)",
                              }}
                            >
                              {errors.progress && touched.progress ? (
                                <Tooltip title={errors.progress} arrow>
                                  <PriorityHigh
                                    color="error"
                                    fontSize="large"
                                  />
                                </Tooltip>
                              ) : null}
                            </Box>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              {task?.progress ? (
                                <Stack
                                  direction="row"
                                  spacing={0}
                                  alignItems="center"
                                >
                                  <Typography
                                    color={
                                      values.progress - task?.progress > 0
                                        ? "#4CBB17"
                                        : values.progress - task?.progress < 0
                                        ? "#FF0000"
                                        : "#000000"
                                    }
                                    variant="h6"
                                  >
                                    {values.progress - task.progress}%
                                  </Typography>
                                  {values.progress - task.progress > 0 ? (
                                    <TrendingUp
                                      sx={{
                                        color: "#4CBB17",
                                        rotate: "-15deg",
                                      }}
                                      fontSize="small"
                                    />
                                  ) : null}
                                  {values.progress - task.progress < 0 ? (
                                    <TrendingDown
                                      sx={{
                                        color: "#FF0000",
                                        rotate: "15deg",
                                      }}
                                      fontSize="small"
                                    />
                                  ) : null}
                                </Stack>
                              ) : null}
                              <NumberField
                                placeholder="Stopień"
                                value={values.progress}
                                onChange={(e) =>
                                  handleNumberChange(e, setFieldValue)
                                }
                                name="progress"
                                icon={<Percent />}
                                min={0}
                                max={100}
                                displayZero
                              />
                            </Stack>
                          </Stack>
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
                        label="Zamknij"
                      />
                      <PrimaryButton
                        type="submit"
                        onClick={() => handleSubmit()}
                        label="Zdaj"
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
