import { Stack, Typography } from "@mui/material"
import "firebase/functions"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { selectInvite } from "../../selectors/invites"
import { selectProject } from "../../selectors/projects"
import { selectWorkspace } from "../../selectors/workspaces"
import { setDragDisabled } from "../../slices/drag"
import { inviteId } from "../../slices/invites"
import { projectId } from "../../slices/projects"
import { workspaceId } from "../../slices/workspaces"
import { Modal as ModalType } from "../DataPanel"
import { Modal } from "../Modal"
import { SecondaryButton } from "../SecondaryButton"

interface ViewInviteModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
  workspaceId: workspaceId
  projectId: projectId
  inviteId: inviteId | undefined
}

export function ViewInviteModal({
  open,
  setModal,
  workspaceId,
  projectId,
  inviteId,
}: ViewInviteModalProps) {
  const dispatch = useAppDispatch()

  const invite = useAppSelector((state) => selectInvite(state, inviteId))

  const workspace = useAppSelector((state) =>
    selectWorkspace(state, workspaceId),
  )
  const project = useAppSelector((state) =>
    selectProject(state, workspaceId, projectId),
  )

  const handleClose = () => {
    setModal(null)
    dispatch(setDragDisabled(false))
  }

  return (
    <Modal open={open} onClose={() => handleClose()}>
      <Stack alignItems="center" justifyContent="center">
        <Stack p={2} bgcolor="white" width="fit-content" spacing={4}>
          <Typography component="span" variant="h6">
            Wysłano zaproszenie do współpracy
          </Typography>
          <Typography variant="body1">
            Zaproszony użytkownik:{" "}
            <Typography component="span" variant="body1" fontWeight={600}>
              {invite?.invitedUserEmail}
            </Typography>
          </Typography>
          <Typography>
            Nazwa projektu:{" "}
            <Typography component="span" variant="body1" fontWeight={600}>
              {project?.title}
            </Typography>{" "}
          </Typography>
          <Typography>
            Nazwa zakładu:{" "}
            <Typography component="span" variant="body1" fontWeight={600}>
              {workspace?.title}
            </Typography>
          </Typography>
          <Typography variant="body1">
            Uprawnienia:{" "}
            <Typography component="span" variant="body1" fontWeight={600}>
              {invite?.permissions}
            </Typography>
          </Typography>
          <Stack direction="row" justifyContent="space-between" spacing={5}>
            <SecondaryButton label="Zamknij" onClick={() => handleClose()} />
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  )
}
