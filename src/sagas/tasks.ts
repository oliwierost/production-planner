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
  updateTaskStart,
  moveTaskStart,
  fetchTasksStart,
} from "../slices/tasks"
import { setToastOpen } from "../slices/toast"
import { removeCells, setCellsOccupied } from "../slices/grid"
import {
  assignTaskToFacilityInFirestore,
  removeTaskFromFacilityInFirestore,
} from "./facilities"
import { updateGridInFirestore } from "./grid"

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

const fetchTasks = async () => {
  const tasks: { [id: string]: Task } = {}
  const querySnapshot = await getDocs(collection(firestore, "tasks"))
  querySnapshot.forEach((doc) => {
    tasks[doc.id] = doc.data() as Task
  })
  return tasks
}

export function* fetchTasksSaga() {
  try {
    const tasks: { [key: string]: Task } = yield call(fetchTasks)
    yield put(setTasks(tasks))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* addTaskSaga(action: PayloadAction<Task>) {
  try {
    yield call(addTaskToFirestore, action.payload)
    yield put(setToastOpen({ message: "Dodano zadanie", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
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
      yield put(assignTaskToFacility({ facilityId: rowId, taskId }))
    } else {
      yield put(removeCells({ rowId, colId, cellSpan: Number(cellSpan) }))
      yield put(removeTaskFromFacility({ facilityId: rowId, taskId }))
    }
    if (dropped) {
      yield call(assignTaskToFacilityInFirestore, rowId, taskId)
    } else {
      yield call(removeTaskFromFacilityInFirestore, rowId, taskId)
    }
    yield call(updateTaskInFirestore, taskId, {
      dropped,
      facilityId: rowId,
      startTime: Number(colId),
    })
    const gridState = yield select((state) => state.grid.grid)
    yield call(updateGridInFirestore, gridState)
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
    yield put(removeTaskFromFacility({ facilityId: sourceRowId, taskId }))
    yield put(
      setCellsOccupied({ rowId, colId, taskId, cellSpan: Number(cellSpan) }),
    )
    yield put(assignTaskToFacility({ facilityId: rowId, taskId }))
    if (sourceRowId !== rowId) {
      yield put(removeTaskFromFacility({ facilityId: sourceRowId, taskId }))
      yield put(assignTaskToFacility({ facilityId: rowId, taskId }))
    }
    yield call(updateTaskInFirestore, taskId, {
      facilityId: rowId,
      startTime: Number(colId),
    })
    if (sourceRowId !== rowId) {
      yield call(assignTaskToFacilityInFirestore, rowId, taskId)
      yield call(removeTaskFromFacilityInFirestore, sourceRowId, taskId)
    }
    const gridState = yield select((state) => state.grid.grid)
    yield call(updateGridInFirestore, gridState)
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
      console.log("syncing tasks...")
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

function* watchFetchTasks() {
  yield takeLatest(fetchTasksStart.type, fetchTasksSaga)
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
    watchFetchTasks(),
    watchUpdateTask(),
  ])
}
