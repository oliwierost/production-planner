import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import PriorityHighIcon from "@mui/icons-material/PriorityHigh"
import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { collection, doc } from "firebase/firestore"
import "firebase/functions"
import { getFunctions, httpsCallable } from "firebase/functions"
import { Form, Formik, FormikHelpers } from "formik"
import { firestore } from "../../../firebase.config"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setDragDisabled } from "../../slices/drag"
import { inviteUserStart } from "../../slices/invites"
import { projectId } from "../../slices/projects"
import { setToastOpen } from "../../slices/toast"
import { userId } from "../../slices/user"
import { Modal as ModalType } from "../DataPanel"
import { Dropdown } from "../Dropdown"
import { Modal } from "../Modal"
import { PrimaryButton } from "../PrimaryButton"
import { SecondaryButton } from "../SecondaryButton"
import { TextField } from "../TextField"
import { TitleBar } from "../TitleBar"

interface CreateProjectModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
  workspaceId: string
  projectId: string
}

export interface CollabFormData {
  id: string
  invitingUserEmail: string
  invitingUserId: userId
  invitedUserEmail: string
  invitedUserId: userId
  projectId: projectId
  workspaceId: string
  permissions: "odczyt" | "edycja" | "raportowanie"
  status: "pending" | "accepted" | "rejected"
  type: "outgoing" | "incoming"
}

const initialValues = {
  id: "",
  invitedUserId: "",
  invitedUserEmail: "",
  invitingUserId: "",
  invitingUserEmail: "",
  projectId: "",
  workspaceId: "",
  permissions: "odczyt",
  status: "pending",
} as CollabFormData

const permissionsOptions = [
  { value: "odczyt", label: "Odczyt" },
  { value: "edycja", label: "Edycja" },
  { value: "raportowanie", label: "Raportowanie" },
]

export function AddCollabModal({
  open,
  setModal,
  workspaceId,
  projectId,
}: CreateProjectModalProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user.user)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<CollabFormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    setFieldValue(name, value)
  }

  const handleSubmit = async (
    values: CollabFormData,
    resetForm: FormikHelpers<CollabFormData>["resetForm"],
  ) => {
    try {
      if (!workspaceId || !projectId || !user) return
      const inviteId = doc(collection(firestore, "invites"))

      const functions = getFunctions()
      const getUserIdByEmail = httpsCallable(functions, "getUserIdByEmail")
      const invitedUserIdResponse = await getUserIdByEmail({
        email: values.invitedUserEmail,
      })
      const invitedUserId = invitedUserIdResponse.data as string
      const invite = {
        ...values,
        id: inviteId.id,
        invitingUserId: user?.id,
        invitingUserEmail: user?.email,
        invitedUserId: invitedUserId,
        projectId,
        workspaceId,
      }
      if (!invitedUserId) {
        dispatch(
          setToastOpen({
            message: "Nie znaleziono użytkownika o podanym adresie email",
            severity: "error",
          }),
        )
        return
      }
      if (invitedUserId == user?.id) {
        dispatch(
          setToastOpen({
            message: "Nie możesz zaprosić samego siebie do współpracy",
            severity: "error",
          }),
        )
        return
      }

      dispatch(
        inviteUserStart({
          invite,
          resetForm,
          setModal,
        }),
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleClose = (
    resetForm: FormikHelpers<CollabFormData>["resetForm"],
  ) => {
    setModal(null)
    resetForm()
    dispatch(setDragDisabled(false))
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={(values: CollabFormData, { resetForm }) =>
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
                    Zaproś użytkownika do współpracy
                  </Typography>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Adres email</Typography>
                      <Stack direction="row" alignItems="center">
                        <Box
                          position="absolute"
                          sx={{
                            transform: "translateX(-30px)",
                          }}
                        >
                          {errors.invitedUserEmail &&
                          touched.invitedUserEmail ? (
                            <Tooltip title={errors.invitedUserEmail} arrow>
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
                          value={values.invitedUserEmail}
                          onChange={(e) => handleInputChange(e, setFieldValue)}
                          name="invitedUserEmail"
                        />
                      </Stack>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Uprawnienia</Typography>
                      <Dropdown
                        placeholder="Wybierz uprawnienia"
                        options={permissionsOptions}
                        value={values.permissions}
                        setFieldValue={setFieldValue}
                        name="permissions"
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
