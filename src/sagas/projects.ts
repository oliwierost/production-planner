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
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore"
import { setToastOpen } from "../slices/toast"
import { eventChannel } from "redux-saga"
import {
  Project,
  projectId,
  setProjects,
  syncProjectsStart,
  upsertProject,
  upsertProjectStart,
} from "../slices/projects"
import { workspaceId } from "../slices/workspaces"
import { userId } from "../slices/user"

const addProjectToFirestore = async (
  userId: userId,
  workspaceId: workspaceId,
  project: Project,
) => {
  await setDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/projects/${project.id}`,
    ),
    project,
  )
}

export function* upsertProjectSaga(
  action: PayloadAction<{
    workspaceId: workspaceId
    project: Project
  }>,
): Generator<any, void, any> {
  const { project, workspaceId } = action.payload
  const userId: userId = yield select((state) => state.user.user.id)

  try {
    yield put(upsertProject({ project: project, workspaceId: workspaceId }))
    yield call(addProjectToFirestore, userId, workspaceId, project)
    yield put(setToastOpen({ message: "Dodano projekt", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* syncProjectsSaga() {
  const userId: userId = yield select((state) => state.user.user?.id)
  const prevProjects: { [id: workspaceId]: { [id: projectId]: Project } } =
    yield select((state) => state.projects.projects)
  if (!userId) return

  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, `users/${userId}/workspaces`)

    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      snapshot.forEach((workspaceDoc) => {
        const workspaceId = workspaceDoc.id
        const projectsRef = collection(
          firestore,
          `users/${userId}/workspaces/${workspaceId}/projects`,
        )
        onSnapshot(projectsRef, async (projectsSnapshot) => {
          const projects = {} as { [id: projectId]: Project }
          projectsSnapshot.forEach(
            (doc) =>
              (projects[doc.id] = {
                id: doc.id,
                ...doc.data(),
              } as Project),
          )
          const newProjects = { ...prevProjects, [workspaceId]: projects }
          emitter(newProjects)
        })
      })
    })

    return unsubscribe
  })

  try {
    while (true) {
      const projects: { [id: workspaceId]: { [id: projectId]: Project } } =
        yield take(channel)
      yield put(setProjects(projects))
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
