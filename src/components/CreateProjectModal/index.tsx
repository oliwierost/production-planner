import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { collection, doc } from "firebase/firestore"
import { Form, Formik, FormikHelpers } from "formik"
import { firestore } from "../../../firebase.config"
import { workspaceModalSchema } from "../../../validationSchema"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import {
  Project,
  updateProjectStart,
  upsertProjectStart,
} from "../../slices/projects"
import { Modal as ModalType } from "../DataPanel"
import { Modal } from "../Modal"
import { PrimaryButton } from "../PrimaryButton"
import { SecondaryButton } from "../SecondaryButton"
import { TextArea } from "../TextArea"
import { TextField } from "../TextField"
import { DateField } from "../DateField"
import { useEffect, useState } from "react"
import { selectProject } from "../../selectors/projects"

interface CreateProjectModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
  workspaceId: string
  projectId?: string
}

interface FormData {
  title: string
  description: string
  invitedUsers: string[]
  startTime: number
  endTime: number
  id: string
}

const initialValues = {
  id: "",
  title: "",
  description: "",
  invitedUsers: [],
  startTime: Date.now(),
  endTime: Date.now(),
}

export function CreateProjectModal({
  open,
  setModal,
  workspaceId,
  projectId,
}: CreateProjectModalProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user.user)
  const [project, setProject] = useState<Project | null>(null)

  const projectData = useAppSelector((state) =>
    selectProject(state, workspaceId, projectId),
  )

  useEffect(() => {
    if (projectData) {
      setProject(projectData)
    }
  }, [projectData])

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
      if (!project) {
        if (workspaceId && user) {
          const id = doc(
            collection(
              firestore,
              `users/${user.id}/workspaces/${workspaceId}/projects`,
            ),
          ).id
          dispatch(
            upsertProjectStart({
              workspaceId,
              project: {
                ...values,
                id,
                workspaceId: workspaceId,
                ownerId: user.id,
              },
            }),
          )
        }
      } else {
        dispatch(
          updateProjectStart({
            project,
            data: {
              ...values,
            },
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
    dispatch(setDragDisabled(false))
  }

  return (
    <Formik
      initialValues={project ? project : initialValues}
      validationSchema={workspaceModalSchema}
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
                  <Typography variant="h6">Dodaj projekt</Typography>
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
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Data rozpoczęcia</Typography>
                      <DateField
                        placeholder="Data rozpoczęcia"
                        value={values.startTime}
                        setFieldValue={setFieldValue}
                        name="startTime"
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Data zakończenia</Typography>
                      <DateField
                        placeholder="Data zakończenia"
                        value={values.endTime}
                        setFieldValue={setFieldValue}
                        name="endTime"
                      />
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
                      label="Dodaj"
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
