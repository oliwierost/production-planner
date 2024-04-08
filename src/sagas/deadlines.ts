import { eventChannel } from "redux-saga"
import { PayloadAction } from "@reduxjs/toolkit"
import {
  call,
  put,
  take,
  cancelled,
  takeLatest,
  all,
  select,
} from "redux-saga/effects"
import { firestore } from "../../firebase.config"
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { setToastOpen } from "../slices/toast"
import {
  Deadline,
  removeDeadline,
  setDeadlines,
  removeDeadlineStart,
  updateDeadlineStart,
  syncDeadlinesStart,
  addDeadlineStart,
  addDeadline,
  deadlineId,
  updateDeadline,
} from "../slices/deadlines"
import { projectId } from "../slices/projects"
import { workspaceId } from "../slices/workspaces"

const addDeadlineToFirestore = async (
  userId: string,
  deadline: Deadline,
  workspaceId: string,
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
  userId: string,
  deadlineId: string,
  workspaceId: string,

  updateData: { [key: string]: any },
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
  userId: string,
  deadlineId: string,
  workspaceId: string,
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
    const userId: string = yield select((state) => state.user.user?.id)
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
    const userId: string = yield select((state) => state.user.user?.id)
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
    deadlineId: string
    data: any
    workspaceId: workspaceId
    projectId: projectId
  }>,
): Generator<any, void, any> {
  try {
    const { deadlineId, data, workspaceId } = action.payload
    const userId: string = yield select((state) => state.user.user?.id)
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

export default function* deadlineSagas() {
  yield all([
    watchAddDeadline(),
    watchDeleteDeadline(),
    watchUpdateDeadline(),
    watchSyncDeadlines(),
  ])
}
