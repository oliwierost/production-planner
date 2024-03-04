import { eventChannel } from "redux-saga"
import { PayloadAction } from "@reduxjs/toolkit"
import { call, put, take, cancelled, takeLatest, all } from "redux-saga/effects"
import { firestore } from "../../firebase.config"
import {
  assignTaskToFacility,
  removeTaskFromFacility,
} from "../slices/facilities"
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore"

import {
  setTasks,
  Task,
  removeTask,
  deleteTaskStart,
  syncTasksStart,
  addTaskStart,
  setTaskDroppedStart,
  setTaskDropped,
  updateTaskStart,
  moveTaskStart,
} from "../slices/tasks"
import { setToastOpen } from "../slices/toast"
import { removeCells, setCellsOccupied } from "../slices/grid"
import {
  assignTaskToFacilityInFirestore,
  removeTaskFromFacilityInFirestore,
} from "./facilities"

const addTaskToFirestore = async (task: Task) => {
  await setDoc(doc(firestore, `tasks/${task.id}`), task)
}

export const undropMultipleTasksInFirestore = async (
  taskIds: Array<string>,
) => {
  const batch = writeBatch(firestore)
  for (const taskId of taskIds) {
    const docRef = doc(firestore, `tasks/${taskId}`)
    batch.update(docRef, { dropped: false })
  }
  await batch.commit()
}

export const updateTaskInFirestore = async (
  id: string,
  updateData: { [key: string]: any },
) => {
  await updateDoc(doc(firestore, `tasks/${id}`), updateData)
}

const deleteTaskFromFirestore = async (taskId: string, facilityId?: string) => {
  await deleteDoc(doc(firestore, `tasks/${taskId}`))
  if (facilityId) {
    await updateDoc(doc(firestore, `facilities/${facilityId}`), {
      tasks: arrayRemove(taskId),
    })
  }
}

export function* addTaskSaga(action: PayloadAction<Task>) {
  try {
    yield call(addTaskToFirestore, action.payload)
    yield put(setToastOpen({ message: "Dodano zadanie", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błądś", severity: "error" }))
  }
}

export function* deleteTaskSaga(
  action: PayloadAction<{
    taskId: string
    facilityId?: string
    colId?: string
    cellSpan?: string
  }>,
): Generator<any, void, any> {
  try {
    const { taskId, facilityId, colId, cellSpan } = action.payload
    if (facilityId && colId && cellSpan) {
      yield put(
        removeCells({ rowId: facilityId, colId, cellSpan: Number(cellSpan) }),
      )
    }
    yield call(deleteTaskFromFirestore, taskId, facilityId)
    yield put(
      setToastOpen({ message: "Usunięto zadanie", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* setTaskDroppedSaga(
  action: PayloadAction<{
    taskId: string
    dropped: boolean
    rowId: string
    colId: string
    cellSpan: string
  }>,
): Generator<any, void, any> {
  try {
    const { taskId, dropped, rowId, colId, cellSpan } = action.payload
    if (dropped) {
      yield put(
        setCellsOccupied({ rowId, colId, taskId, cellSpan: Number(cellSpan) }),
      )
      yield call(assignTaskToFacilityInFirestore, rowId, taskId)
    } else {
      yield put(removeCells({ rowId, colId, cellSpan: Number(cellSpan) }))
      yield call(removeTaskFromFacilityInFirestore, rowId, taskId)
    }
    yield call(updateTaskInFirestore, taskId, { dropped })
    // no need to set the toast here as the toast is displayed on successful grid update
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* moveTaskSaga(
  action: PayloadAction<{
    sourceRowId: string
    sourceColId: string
    rowId: string
    colId: string
    cellSpan: number
    taskId: string
  }>,
): Generator<any, void, any> {
  const { sourceRowId, sourceColId, rowId, colId, cellSpan, taskId } =
    action.payload
  try {
    yield put(
      removeCells({
        rowId: sourceRowId,
        colId: sourceColId,
        cellSpan,
      }),
    )
    yield put(
      setCellsOccupied({ rowId, colId, taskId, cellSpan: Number(cellSpan) }),
    )
    if (sourceRowId !== rowId) {
      yield call(assignTaskToFacilityInFirestore, rowId, taskId)
      yield call(removeTaskFromFacilityInFirestore, sourceRowId, taskId)
    }
    // yield call(updateTaskInFirestore, taskId, { rowId, colId, cellSpan })
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* updateTaskSaga(
  action: PayloadAction<{ id: string; data: any }>,
): Generator<any, void, any> {
  try {
    const { id, data } = action.payload
    yield call(updateTaskInFirestore, id, data)
    yield put(
      setToastOpen({ message: "Zaktualizowano zadanie", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "success" }))
  }
}

export function* syncTasksSaga() {
  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, "tasks")
    const unsubscribe = onSnapshot(colRef, async () => {
      const snapshot = await getDocs(collection(firestore, "tasks"))
      const tasks = {} as { [key: string]: Task }
      snapshot.forEach(
        (doc) => (tasks[doc.id] = { id: doc.id, ...doc.data() } as Task),
      )
      emitter(tasks)
    })

    return unsubscribe
  })

  try {
    while (true) {
      const tasks: { [key: string]: Task } = yield take(channel)
      yield put(setTasks(tasks))
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

function* watchAddTask() {
  yield takeLatest(addTaskStart.type, addTaskSaga)
}

function* watchDeleteTask() {
  yield takeLatest(deleteTaskStart.type, deleteTaskSaga)
}

function* watchUpdateTask() {
  yield takeLatest(updateTaskStart.type, updateTaskSaga)
}

function* watchSetTaskDropped() {
  yield takeLatest(setTaskDroppedStart.type, setTaskDroppedSaga)
}

function* watchMoveTask() {
  yield takeLatest(moveTaskStart.type, moveTaskSaga)
}

function* watchSyncTasks() {
  yield takeLatest(syncTasksStart.type, syncTasksSaga)
}

export default function* taskSagas() {
  yield all([
    watchAddTask(),
    watchDeleteTask(),
    watchSyncTasks(),
    watchSetTaskDropped(),
    watchMoveTask(),
    watchUpdateTask(),
  ])
}
