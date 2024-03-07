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
import { Workspace } from "../slices/workspaces"
import { eventChannel } from "redux-saga"
import { hashObject } from "./facilities"
import {
  Project,
  setProjects,
  syncProjectsStart,
  upsertProject,
  upsertProjectStart,
} from "../slices/projects"

const addProjectToFirestore = async (workspaceId: string, project: Project) => {
  await setDoc(
    doc(
      firestore,
      `users/first-user/workspaces/${workspaceId}/projects/${project.id}`,
    ),
    project,
  )
}

export function* upsertProjectSaga(
  action: PayloadAction<{
    project: Project
  }>,
): Generator<any, void, any> {
  const { project } = action.payload
  const selectedWorkspaceId: string = yield select(
    (state) => state.workspaces.selectedWorkspace,
  )
  try {
    yield put(upsertProject(project))
    yield call(addProjectToFirestore, selectedWorkspaceId, project)
    yield put(setToastOpen({ message: "Dodano projekt", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* syncProjectsSaga() {
  const selectedWorkspaceId: string = yield select(
    (state) => state.workspaces.selectedWorkspace,
  )
  const channel = eventChannel((emitter) => {
    const colRef = collection(
      firestore,
      `users/first-user/workspaces/${selectedWorkspaceId}/projects`,
    )
    const unsubscribe = onSnapshot(colRef, async () => {
      const snapshot = await getDocs(
        collection(
          firestore,
          `users/first-user/workspaces/${selectedWorkspaceId}/projects`,
        ),
      )
      const projects = {} as { [key: string]: Project }
      snapshot.forEach(
        (doc) => (projects[doc.id] = { id: doc.id, ...doc.data() } as Project),
      )
      emitter(projects)
    })

    return unsubscribe
  })

  try {
    while (true) {
      const projects: { [key: string]: Workspace } = yield take(channel)
      const prevProjects: { [key: string]: Workspace } = yield select(
        (state) => state.workspaces.workspaces,
      )
      if (hashObject(prevProjects) !== hashObject(projects)) {
        yield put(setProjects(projects))
      }
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

function* watchUpsertProjects() {
  yield takeLatest(upsertProjectStart.type, upsertProjectSaga)
}

function* watchSyncProjects() {
  yield takeLatest(syncProjectsStart.type, syncProjectsSaga)
}

export default function* projectsSagas() {
  yield all([watchUpsertProjects(), watchSyncProjects()])
}
