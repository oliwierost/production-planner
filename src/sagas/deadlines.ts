import { eventChannel } from "redux-saga"
import { PayloadAction } from "@reduxjs/toolkit"
import { call, put, take, cancelled, takeLatest, all } from "redux-saga/effects"
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
import { Deadline, PartialUpdate } from "../../types"
import {
  removeDeadline,
  setDeadlines,
  removeDeadlineStart,
  updateDeadlineStart,
  syncDeadlinesStart,
  addDeadlineStart,
} from "../slices/deadlines"

const addDeadlineToFirestore = async (deadline: Deadline) => {
  await setDoc(doc(firestore, `deadlines/${deadline.id}`), deadline)
}

const updateDeadlineInFirestore = async (
  id: string,
  updateData: PartialUpdate<Deadline>,
) => {
  await updateDoc(doc(firestore, `tasks/${id}`), updateData)
}

const deleteDeadlineFromFirestore = async (deadlineId: string) => {
  await deleteDoc(doc(firestore, `deadlines/${deadlineId}`))
}

export function* addDeadlineSaga(action: PayloadAction<Deadline>) {
  try {
    yield call(addDeadlineToFirestore, action.payload)
    yield put(setToastOpen({ message: "Dodano deadline", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* deleteDeadlineSaga(
  action: PayloadAction<{
    deadlineId: string
  }>,
) {
  try {
    const deadlineId = action.payload.deadlineId

    yield call(deleteDeadlineFromFirestore, deadlineId)
    yield put(removeDeadline(deadlineId))
    yield put(
      setToastOpen({ message: "Usunięto deadline", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* updateDeadlineSaga(
  action: PayloadAction<{ id: string; data: PartialUpdate<Deadline> }>,
) {
  try {
    const { id, data } = action.payload
    yield call(updateDeadlineInFirestore, id, data)
    yield put(
      setToastOpen({ message: "Zaktualizowano deadline", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "success" }))
  }
}

export function* syncDeadlinesSaga() {
  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, "deadlines")
    const unsubscribe = onSnapshot(colRef, async () => {
      const snapshot = await getDocs(collection(firestore, "deadlines"))
      const deadlines = {} as { [key: string]: Deadline }
      snapshot.forEach(
        (doc) =>
          (deadlines[doc.id] = {
            id: doc.id,
            ...doc.data(),
          } as unknown as Deadline),
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
