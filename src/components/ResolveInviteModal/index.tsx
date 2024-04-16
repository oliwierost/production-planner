import { Stack, Typography } from "@mui/material"
import "firebase/functions"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { selectInvite } from "../../selectors/invites"
import { selectProject } from "../../selectors/projects"
import { selectWorkspace } from "../../selectors/workspaces"
import { setDragDisabled } from "../../slices/drag"
import {
  acceptInviteStart,
  inviteId,
  rejectInviteStart,
} from "../../slices/invites"
import { projectId } from "../../slices/projects"
import { workspaceId } from "../../slices/workspaces"
import { AcceptButton } from "../AcceptButton"
import { Modal as ModalType } from "../DataPanel"
import { DeclineButton } from "../DecilineButton"
import { Modal } from "../Modal"
import { TitleBar } from "../TitleBar"

interface ResolveInviteModalProps {
  open: boolean
  setModal: React.Dispatch<React.SetStateAction<ModalType | null>>
  workspaceId: workspaceId
  projectId: projectId
  inviteId: inviteId | undefined
}

export function ResolveInviteModal({
  open,
  setModal,
  workspaceId,
  projectId,
  inviteId,
}: ResolveInviteModalProps) {
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

  if (!invite || !workspace) {
    return null
  }

  const handleAccept = () => {
    dispatch(acceptInviteStart(invite))
    setModal(null)
  }

  const handleReject = () => {
    dispatch(rejectInviteStart(invite))
    setModal(null)
  }

  return (
    <Modal open={open} onClose={() => handleClose()}>
      <Stack alignItems="center" justifyContent="center">
        <TitleBar onClose={() => handleClose()} />
        <Stack p={2} bgcolor="white" width="fit-content" spacing={4}>
          <Typography component="span" variant="h6">
            Otrzymano zaproszenie do współpracy
          </Typography>
          <Typography variant="body1">
            Zaproszono przez użytkownika:{" "}
            <Typography component="span" variant="body1" fontWeight={600}>
              {invite?.invitingUserEmail}
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
            <DeclineButton onClick={() => handleReject()} />
            <AcceptButton onClick={() => handleAccept()} />
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  )
}
