import { PayloadAction } from "@reduxjs/toolkit"
import {
  call,
  put,
  takeLatest,
  all,
  select,
  take,
  cancelled,
  race,
} from "redux-saga/effects"
import { firestore } from "../../firebase.config"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore"
import { setToastOpen } from "../slices/toast"
import {
  Workspace,
  setDisplayArrows,
  setDisplayArrowsStart,
  setWorkspace,
  setWorkspaces,
  syncCollabWorkspacesStart,
  syncWorkspacesStart,
  upsertWorkspace,
  upsertWorkspaceStart,
} from "../slices/workspaces"
import { EventChannel, eventChannel } from "redux-saga"
import { hashObject } from "./facilities"
import { Invite } from "../slices/invites"

const addWorkspaceToFirestore = async (
  userId: string,
  workspace: Workspace,
) => {
  await setDoc(
    doc(firestore, `users/${userId}/workspaces/${workspace.id}`),
    workspace,
  )
}

export function* upsertWorkspaceSaga(
  action: PayloadAction<Workspace>,
): Generator<any, void, any> {
  const workspace = action.payload
  const userId: string = yield select((state) => state.user.user?.id)
  try {
    yield put(upsertWorkspace(workspace))
    yield call(addWorkspaceToFirestore, userId, workspace)
    yield put(setToastOpen({ message: "Dodano zakład", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* setDisplayArrowsSaga(
  action: PayloadAction<{
    workspaceId: string
    displayArrows: boolean
  }>,
): Generator<any, void, any> {
  const { workspaceId, displayArrows } = action.payload
  try {
    yield put(setDisplayArrows({ workspaceId, displayArrows }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* syncWorkspacesSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  if (!userId) return
  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, `users/${userId}/workspaces`)
    const unsubscribe = onSnapshot(colRef, async () => {
      const snapshot = await getDocs(colRef)
      const workspaces = {} as { [key: string]: Workspace }
      snapshot.forEach(
        (doc) =>
          (workspaces[doc.id] = { id: doc.id, ...doc.data() } as Workspace),
      )
      emitter(workspaces)
    })

    return unsubscribe
  })

  try {
    while (true) {
      const workspaces: { [key: string]: Workspace } = yield take(channel)
      const prevWorkspaces: { [key: string]: Workspace } = yield select(
        (state) => state.workspaces.workspaces,
      )
      if (hashObject(prevWorkspaces) !== hashObject(workspaces)) {
        yield put(setWorkspaces(workspaces))
      }
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

export function* syncCollabWorkspacesSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  const invites: { [key: string]: Invite } = yield select(
    (state) => state.invites.invites,
  )

  if (!userId || Object.keys(invites).length === 0) return

  const channels: EventChannel<Workspace>[] = Object.values(invites).map(
    (invite) => {
      return eventChannel((emitter) => {
        const docRef = doc(
          firestore,
          `users/${invite.invitingUserId}/workspaces/${invite.workspaceId}`,
        )
        const unsubscribe = onSnapshot(docRef, async () => {
          const snapshot = await getDoc(docRef)
          const workspace = {
            ...snapshot.data(),
            inviteId: invite.id,
          } as Workspace
          emitter(workspace)
        })
        return unsubscribe
      })
    },
  )

  try {
    while (true) {
      const results: Workspace[] = yield race(
        channels.map((channel) => take(channel)),
      )
      for (const result of results) {
        if (result) {
          const workspace: Workspace = result
          yield put(setWorkspace(workspace))
        }
      }
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channels.forEach((channel) => channel.close())
    }
  }
}

function* watchUpsertWorkspace() {
  yield takeLatest(upsertWorkspaceStart.type, upsertWorkspaceSaga)
}

function* watchSetDisplayArrows() {
  yield takeLatest(setDisplayArrowsStart.type, setDisplayArrowsSaga)
}

function* watchSyncWorkspaces() {
  yield takeLatest(syncWorkspacesStart.type, syncWorkspacesSaga)
}

function* watchSyncCollabWorkspaces() {
  yield takeLatest(syncCollabWorkspacesStart.type, syncCollabWorkspacesSaga)
}

export default function* workspacesSagas() {
  yield all([
    watchUpsertWorkspace(),
    watchSyncWorkspaces(),
    watchSyncCollabWorkspaces(),
    watchSetDisplayArrows(),
  ])
}
