import { PayloadAction } from "@reduxjs/toolkit"
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { FormikHelpers } from "formik"
import { eventChannel } from "redux-saga"
import {
  all,
  call,
  cancelled,
  put,
  select,
  take,
  takeLatest,
} from "redux-saga/effects"
import { firestore } from "../../firebase.config"
import { CollabFormData } from "../components/AddCollabModal"
import { Modal } from "../components/DataPanel"
import {
  acceptInvite,
  acceptInviteStart,
  Invite,
  inviteId,
  inviteUserStart,
  rejectInvite,
  rejectInviteStart,
  setInvites,
  syncInvitesStart,
} from "../slices/invites"
import { addInvitedUserToProject, Project, projectId } from "../slices/projects"
import { setToastOpen } from "../slices/toast"
import { userId } from "../slices/user"
import { workspaceId } from "../slices/workspaces"
import { hashObject } from "./facilities"

const addInvitedUserToProjectInFirestore = async (
  projectId: projectId,
  workspaceId: workspaceId,
  invitingUserId: inviteId,
  invitedUserId: inviteId,
) => {
  await updateDoc(
    doc(
      firestore,
      `users/${invitingUserId}/workspaces/${workspaceId}/projects/${projectId}`,
    ),
    {
      invitedUsers: arrayUnion(invitedUserId),
    },
  )
}

const inviteUserInFirestore = async (
  invitingUserId: userId,
  invitedUserId: userId,
  invite: Invite,
) => {
  await setDoc(doc(firestore, `users/${invitedUserId}/invites/${invite.id}`), {
    ...invite,
    type: "incoming",
  })
  await setDoc(doc(firestore, `users/${invitingUserId}/invites/${invite.id}`), {
    ...invite,
    type: "outgoing",
  })
}

const acceptInviteInFirestore = async (invite: Invite) => {
  await updateDoc(
    doc(firestore, `users/${invite.invitingUserId}/invites/${invite.id}`),
    {
      status: "accepted",
    },
  )
  await updateDoc(
    doc(firestore, `users/${invite.invitedUserId}/invites/${invite.id}`),
    {
      status: "accepted",
    },
  )
}

const rejectInviteInFirestore = async (invite: Invite) => {
  await updateDoc(
    doc(firestore, `users/${invite.invitingUserId}/invites/${invite.id}`),
    {
      status: "rejected",
    },
  )
  await updateDoc(
    doc(firestore, `users/${invite.invitedUserId}/invites/${invite.id}`),
    {
      status: "rejected",
    },
  )
}

export function* inviteUserSaga(
  action: PayloadAction<{
    invite: Invite
    resetForm: FormikHelpers<CollabFormData>["resetForm"]
    setModal: React.Dispatch<React.SetStateAction<Modal | null>>
  }>,
) {
  try {
    const { invite, resetForm, setModal } = action.payload
    const { invitedUserId } = invite
    const project: Project = yield select(
      (state) => state.projects.projects[invite.workspaceId][invite.projectId],
    )
    if (project?.invitedUsers && project.invitedUsers.includes(invitedUserId)) {
      yield put(
        setToastOpen({
          message: "Użytkownik został już zaproszony",
          severity: "error",
        }),
      )
      return
    } else {
      yield put(
        addInvitedUserToProject({
          projectId: invite.projectId,
          workspaceId: invite.workspaceId,
          invitedUserId: invite.invitedUserId,
        }),
      )
      yield call(
        addInvitedUserToProjectInFirestore,
        invite.projectId,
        invite.workspaceId,
        invite.invitingUserId,
        invite.invitedUserId,
      )
      yield call(
        inviteUserInFirestore,
        invite.invitingUserId,
        invite.invitedUserId,
        invite,
      )
    }
    resetForm()
    setModal(null)
    yield put(
      setToastOpen({
        message: "Zaproszenie zostało wysłane",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* acceptInviteSaga(action: PayloadAction<Invite>) {
  const invite = action.payload
  try {
    yield put(acceptInvite(invite))
    yield call(acceptInviteInFirestore, invite)
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* rejectInviteSaga(action: PayloadAction<Invite>) {
  const invite = action.payload
  try {
    yield put(rejectInvite(invite))
    yield call(rejectInviteInFirestore, invite)
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* syncInvitesSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  if (!userId) return
  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, `users/${userId}/invites`)
    const unsubscribe = onSnapshot(colRef, async () => {
      const snapshot = await getDocs(colRef)
      const invites = {} as { [key: inviteId]: Invite }
      snapshot.forEach(
        (doc) => (invites[doc.id] = { id: doc.id, ...doc.data() } as Invite),
      )
      emitter(invites)
    })

    return unsubscribe
  })

  try {
    while (true) {
      const invites: { [key: inviteId]: Invite } = yield take(channel)
      const prevInvites: { [key: string]: Invite } = yield select(
        (state) => state.invites.invites,
      )
      if (hashObject(prevInvites) !== hashObject(invites)) {
        yield put(setInvites(invites))
      }
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

function* watchInviteUser() {
  yield takeLatest(inviteUserStart.type, inviteUserSaga)
}

function* watchAcceptInvite() {
  yield takeLatest(acceptInviteStart.type, acceptInviteSaga)
}

function* watchRejectInvite() {
  yield takeLatest(rejectInviteStart.type, rejectInviteSaga)
}

function* watchSyncInvites() {
  yield takeLatest(syncInvitesStart.type, syncInvitesSaga)
}

export default function* inviteSagas() {
  yield all([
    watchInviteUser(),
    watchSyncInvites(),
    watchAcceptInvite(),
    watchRejectInvite(),
  ])
}
