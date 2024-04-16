import { PayloadAction } from "@reduxjs/toolkit"
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { EventChannel, eventChannel } from "redux-saga"
import {
  all,
  call,
  cancelled,
  put,
  race,
  select,
  take,
  takeLatest,
} from "redux-saga/effects"
import { firestore } from "../../firebase.config"
import { selectProject } from "../selectors/projects"
import {
  addDeadline,
  addDeadlineStart,
  Deadline,
  deadlineId,
  removeDeadline,
  removeDeadlineStart,
  setCollabDeadlines,
  setDeadlines,
  syncCollabDeadlinesStart,
  syncDeadlinesStart,
  updateDeadline,
  updateDeadlineStart,
} from "../slices/deadlines"
import { Invite } from "../slices/invites"
import { Project, projectId } from "../slices/projects"
import { setToastOpen } from "../slices/toast"
import { userId } from "../slices/user"
import { workspaceId } from "../slices/workspaces"

const addDeadlineToFirestore = async (
  userId: userId,
  deadline: Deadline,
  workspaceId: workspaceId,
) => {
  await setDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/deadlines/${deadline.id}`,
    ),
    deadline,
  )
}

const updateDeadlineInFirestore = async (
  userId: userId,
  deadlineId: deadlineId,
  workspaceId: workspaceId,
  updateData: Partial<Deadline>,
) => {
  await updateDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/deadlines/${deadlineId}`,
    ),
    updateData,
  )
}

const deleteDeadlineFromFirestore = async (
  userId: userId,
  deadlineId: deadlineId,
  workspaceId: workspaceId,
) => {
  await deleteDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/deadlines/${deadlineId}`,
    ),
  )
}

export function* addDeadlineSaga(action: PayloadAction<Deadline>) {
  try {
    const deadline = action.payload
    const project: Project = yield select((state) =>
      selectProject(state, deadline.workspaceId, deadline.projectId),
    )
    const userId = project.ownerId
    yield put(addDeadline(deadline))
    yield call(addDeadlineToFirestore, userId, deadline, deadline.workspaceId)
    yield put(setToastOpen({ message: "Dodano deadline", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* deleteDeadlineSaga(
  action: PayloadAction<Deadline>,
): Generator<any, void, any> {
  try {
    const deadline = action.payload
    const project: Project = yield select((state) =>
      selectProject(state, deadline.workspaceId, deadline.projectId),
    )
    const userId = project.ownerId
    yield put(removeDeadline(deadline))
    yield call(
      deleteDeadlineFromFirestore,
      userId,
      deadline.id,
      deadline.workspaceId,
    )
    yield put(
      setToastOpen({ message: "Usunięto deadline", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* updateDeadlineSaga(
  action: PayloadAction<{
    deadlineId: deadlineId
    data: any
    workspaceId: workspaceId
    projectId: projectId
  }>,
): Generator<any, void, any> {
  try {
    const { deadlineId, data, workspaceId, projectId } = action.payload
    const project: Project = yield select((state) =>
      selectProject(state, workspaceId, projectId),
    )
    const userId = project.ownerId
    yield put(updateDeadline(data))
    yield call(updateDeadlineInFirestore, userId, deadlineId, workspaceId, data)
    yield put(
      setToastOpen({ message: "Zaktualizowano deadline", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "success" }))
  }
}

export function* syncDeadlinesSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  const prevDeadlines: { [key: string]: Deadline } = yield select(
    (state) => state.deadlines.deadlines,
  )
  if (!userId) return
  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, `users/${userId}/workspaces`)

    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      snapshot.forEach((workspaceDoc) => {
        const workspaceId = workspaceDoc.id
        const projectsRef = collection(
          firestore,
          `users/${userId}/workspaces/${workspaceId}/deadlines`,
        )
        onSnapshot(projectsRef, async (projectsSnapshot) => {
          const newDeadlines = { ...prevDeadlines }
          projectsSnapshot.forEach((doc) => {
            const deadline = doc.data() as Deadline
            if (!newDeadlines[deadline.projectId]) {
              newDeadlines[deadline.projectId] = {} as Deadline
            }
            newDeadlines[deadline.projectId] = {
              ...newDeadlines[deadline.projectId],
              [deadline.id]: deadline,
            }
          })
          emitter(newDeadlines)
        })
      })
    })

    return unsubscribe
  })

  try {
    while (true) {
      const deadlines: { [id: projectId]: { [id: deadlineId]: Deadline } } =
        yield take(channel)
      yield put(setDeadlines(deadlines))
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

export function* syncCollabDeadlinesSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  const invites: { [key: string]: Invite } = yield select(
    (state) => state.invites.invites,
  )

  if (!userId || Object.keys(invites).length === 0) return

  const channels: EventChannel<Deadline[]>[] = Object.values(invites).map(
    (invite) => {
      return eventChannel((emitter) => {
        const colRef = collection(
          firestore,
          `users/${invite.invitingUserId}/workspaces/${invite.workspaceId}/deadlines`,
        )
        const unsubscribe = onSnapshot(colRef, async () => {
          const snapshot = await getDocs(colRef)
          const deadlines = snapshot.docs.map((doc) => ({
            id: doc.id,
            inviteId: invite.id,
            ...doc.data(),
          })) as Deadline[]
          emitter(deadlines)
        })
        return unsubscribe
      })
    },
  )

  try {
    while (true) {
      const results: Deadline[][] = yield race(
        channels.map((channel) => take(channel)),
      )
      for (const result of results) {
        if (result) {
          const deadlines: Deadline[] = result
          yield put(setCollabDeadlines(deadlines))
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

function* watchAddDeadline() {
  yield takeLatest(addDeadlineStart.type, addDeadlineSaga)
}

function* watchDeleteDeadline() {
  yield takeLatest(removeDeadlineStart.type, deleteDeadlineSaga)
}

function* watchUpdateDeadline() {
  yield takeLatest(updateDeadlineStart.type, updateDeadlineSaga)
}

function* watchSyncDeadlines() {
  yield takeLatest(syncDeadlinesStart.type, syncDeadlinesSaga)
}

function* watchSyncCollabDeadlines() {
  yield takeLatest(syncCollabDeadlinesStart.type, syncCollabDeadlinesSaga)
}

export default function* deadlineSagas() {
  yield all([
    watchAddDeadline(),
    watchDeleteDeadline(),
    watchUpdateDeadline(),
    watchSyncDeadlines(),
    watchSyncCollabDeadlines(),
  ])
}
