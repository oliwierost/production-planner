import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { collection, doc } from "firebase/firestore"
import { Form, Formik, FormikHelpers } from "formik"
import { firestore } from "../../../firebase.config"
import { workspaceModalSchema } from "../../../validationSchema"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import { upsertWorkspaceStart } from "../../slices/workspaces"
import { Modal as ModalType } from "../DataPanel"
import { Modal } from "../Modal"
import { PrimaryButton } from "../PrimaryButton"
import { SecondaryButton } from "../SecondaryButton"
import { TextArea } from "../TextArea"
import { TextField } from "../TextField"

interface CreateWorkspaceModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
}

interface FormData {
  title: string
  description: string
  ownerId: string
  id: string
  displayArrows: boolean
}

const initialValues = {
  id: "",
  title: "",
  description: "",
  ownerId: "",
  displayArrows: true,
}

export function CreateWorkspaceModal({
  open,
  setModal,
}: CreateWorkspaceModalProps) {
  const dispatch = useAppDispatch()

  const user = useAppSelector((state) => state.user.user)

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
      if (!user) return
      const id = doc(collection(firestore, `users/${user.id}/workspaces`)).id
      dispatch(
        upsertWorkspaceStart({
          ...values,
          id,
          ownerId: user.id,
          displayArrows: true,
        }),
      )
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
      initialValues={initialValues}
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
                  <Typography variant="h6">Dodaj zakład</Typography>
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
