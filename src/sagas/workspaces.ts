import { PayloadAction } from "@reduxjs/toolkit"
import { call, put, takeLatest, all } from "redux-saga/effects"
import { firestore } from "../../firebase.config"
import { doc, setDoc } from "firebase/firestore"
import { setToastOpen } from "../slices/toast"
import {
  Workspace,
  upsertWorkspace,
  upsertWorkspaceStart,
} from "../slices/workspaces"

const addWorkspaceToFirestore = async (workspace: Workspace) => {
  await setDoc(doc(firestore, `workspaces/${workspace.id}`), workspace)
}

export function* upsertWorkspaceSaga(
  action: PayloadAction<Workspace>,
): Generator<any, void, any> {
  const workspace = action.payload
  try {
    yield put(upsertWorkspace(workspace))
    yield call(addWorkspaceToFirestore, workspace)
    yield put(setToastOpen({ message: "Dodano zakład", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

function* watchUpsertWorkspace() {
  yield takeLatest(upsertWorkspaceStart.type, upsertWorkspaceSaga)
}

export default function* workspacesSagas() {
  yield all([watchUpsertWorkspace()])
}
