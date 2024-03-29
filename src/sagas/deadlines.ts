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
  getDocs,
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
} from "../slices/deadlines"

const addDeadlineToFirestore = async (
  userId: string,
  deadline: Deadline,
  workspaceId: string,
  projectId: string,
) => {
  await setDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/projects/${projectId}/deadlines/${deadline.id}`,
    ),
    deadline,
  )
}

const updateDeadlineInFirestore = async (
  userId: string,
  deadlineId: string,
  workspaceId: string,
  projectId: string,
  updateData: { [key: string]: any },
) => {
  await updateDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/projects/${projectId}/deadlines/${deadlineId}`,
    ),
    updateData,
  )
}

const deleteDeadlineFromFirestore = async (
  userId: string,
  deadlineId: string,
  workspaceId: string,
  projectId: string,
) => {
  await deleteDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/projects/${projectId}/deadlines/${deadlineId}`,
    ),
  )
}

export function* addDeadlineSaga(action: PayloadAction<Deadline>) {
  try {
    const userId: string = yield select((state) => state.user.user?.id)
    const selectedWorkspace: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    const selectedProject: string = yield select(
      (state) => state.projects.selectedProject,
    )
    yield call(
      addDeadlineToFirestore,
      userId,
      action.payload,
      selectedWorkspace,
      selectedProject,
    )
    yield put(setToastOpen({ message: "Dodano deadline", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* deleteDeadlineSaga(
  action: PayloadAction<{
    deadlineId: string
  }>,
): Generator<any, void, any> {
  try {
    const deadlineId = action.payload.deadlineId
    const userId: string = yield select((state) => state.user.user?.id)
    const selectedWorkspace: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    const selectedProject: string = yield select(
      (state) => state.projects.selectedProject,
    )
    yield call(
      deleteDeadlineFromFirestore,
      userId,
      deadlineId,
      selectedWorkspace,
      selectedProject,
    )
    yield put(removeDeadline(deadlineId))
    yield put(
      setToastOpen({ message: "Usunięto deadline", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* updateDeadlineSaga(
  action: PayloadAction<{ deadlineId: string; data: any }>,
): Generator<any, void, any> {
  try {
    const { deadlineId, data } = action.payload
    const userId: string = yield select((state) => state.user.user?.id)
    const selectedWorkspace: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    const selectedProject: string = yield select(
      (state) => state.projects.selectedProject,
    )
    yield call(
      updateDeadlineInFirestore,
      userId,
      deadlineId,
      selectedWorkspace,
      selectedProject,
      data,
    )
    yield put(
      setToastOpen({ message: "Zaktualizowano deadline", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "success" }))
  }
}

export function* syncDeadlinesSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  const selectedWorkspace: string = yield select(
    (state) => state.workspaces.selectedWorkspace,
  )
  const selectedProject: string = yield select(
    (state) => state.projects.selectedProject,
  )
  if (!userId || !selectedWorkspace || !selectedProject) return
  const channel = eventChannel((emitter) => {
    const colRef = collection(
      firestore,
      `users/${userId}/workspaces/${selectedWorkspace}/projects/${selectedProject}/deadlines`,
    )
    const unsubscribe = onSnapshot(colRef, async () => {
      const snapshot = await getDocs(colRef)
      const deadlines = {} as { [key: string]: Deadline }
      snapshot.forEach(
        (doc) =>
          (deadlines[doc.id] = {
            id: doc.id,
            ...doc.data(),
          } as Deadline),
      )
      emitter(deadlines)
    })

    return unsubscribe
  })

  try {
    while (true) {
      const deadlines: { [key: string]: Deadline } = yield take(channel)
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
