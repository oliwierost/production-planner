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
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore"
import { setToastOpen } from "../slices/toast"
import { EventChannel, eventChannel } from "redux-saga"
import {
  Project,
  projectId,
  setProject,
  setProjects,
  syncCollabProjectsStart,
  syncProjectsStart,
  upsertProject,
  upsertProjectStart,
} from "../slices/projects"
import { workspaceId } from "../slices/workspaces"
import { userId } from "../slices/user"
import { Invite } from "../slices/invites"

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

export function* syncCollabProjectsSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  const invites: { [key: string]: Invite } = yield select(
    (state) => state.invites.invites,
  )

  if (!userId || Object.keys(invites).length === 0) return

  const channels: EventChannel<Project>[] = Object.values(invites).map(
    (invite) => {
      return eventChannel((emitter) => {
        const docRef = doc(
          firestore,
          `users/${invite.invitingUserId}/workspaces/${invite.workspaceId}/projects/${invite.projectId}`,
        )
        const unsubscribe = onSnapshot(docRef, async () => {
          const snapshot = await getDoc(docRef)
          const project = {
            ...snapshot.data(),
            inviteId: invite.id,
            workspaceId: invite.workspaceId,
          } as Project
          emitter(project)
        })
        return unsubscribe
      })
    },
  )

  try {
    while (true) {
      const results: Project[] = yield race(
        channels.map((channel) => take(channel)),
      )
      for (const result of results) {
        if (result) {
          const collabProject: Project = result
          yield put(setProject(collabProject))
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

function* watchUpsertProjects() {
  yield takeLatest(upsertProjectStart.type, upsertProjectSaga)
}

function* watchSyncProjects() {
  yield takeLatest(syncProjectsStart.type, syncProjectsSaga)
}

function* watchSyncCollabProjects() {
  yield takeLatest(syncCollabProjectsStart.type, syncCollabProjectsSaga)
}

export default function* projectsSagas() {
  yield all([
    watchUpsertProjects(),
    watchSyncProjects(),
    watchSyncCollabProjects(),
  ])
}
