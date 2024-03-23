import { PayloadAction } from "@reduxjs/toolkit"
import {
  call,
  put,
  takeLatest,
  all,
  select,
  take,
  cancelled,
} from "redux-saga/effects"
import { firestore } from "../../firebase.config"
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore"
import { setToastOpen } from "../slices/toast"
import {
  Workspace,
  setWorkspaces,
  syncWorkspacesStart,
  upsertWorkspace,
  upsertWorkspaceStart,
} from "../slices/workspaces"
import { eventChannel } from "redux-saga"
import { hashObject } from "./facilities"

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

function* watchUpsertWorkspace() {
  yield takeLatest(upsertWorkspaceStart.type, upsertWorkspaceSaga)
}

function* watchSyncWorkspaces() {
  yield takeLatest(syncWorkspacesStart.type, syncWorkspacesSaga)
}

export default function* workspacesSagas() {
  yield all([watchUpsertWorkspace(), watchSyncWorkspaces()])
}
