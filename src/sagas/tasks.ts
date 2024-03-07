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
  arrayUnion,
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
  deleteTaskStart,
  syncTasksStart,
  addTaskStart,
  setTaskDroppedStart,
  updateTaskStart,
  moveTaskStart,
  fetchTasksStart,
  setTaskDragged,
  setTaskDraggedStart,
  updateTask,
  upsertTask,
} from "../slices/tasks"
import { setToastOpen } from "../slices/toast"
import {
  GridType,
  removeCells,
  setCellsOccupied,
  setTaskDraggedInCell,
} from "../slices/grid"
import { setDraggedTask } from "../slices/drag"
import { hashObject } from "./facilities"

const addTaskToFirestore = async ({
  task,
  workspaceId,
}: {
  task: Task
  workspaceId: string
}) => {
  await setDoc(
    doc(
      firestore,
      `users/first-user/workspaces/${workspaceId}/tasks/${task.id}`,
    ),
    task,
  )
}

export const undropMultipleTasksInFirestore = async (
  taskIds: Array<string>,
  workspaceId: string,
) => {
  const batch = writeBatch(firestore)
  for (const taskId of taskIds) {
    const docRef = doc(
      firestore,
      `users/first-user/workspaces/${workspaceId}/tasks/${taskId}`,
    )
    batch.update(docRef, { startTime: null })
  }
  await batch.commit()
}

export const setTaskDroppedInFirestore = async (
  taskId: string,
  dropped: boolean,
  facilityId: string,
  colId: string,
  gridState: GridType,
  workspaceId: string,
) => {
  const batch = writeBatch(firestore)
  const facilityRef = doc(
    firestore,
    `users/first-user/workspaces/${workspaceId}/facilities/${facilityId}`,
  )
  const taskRef = doc(
    firestore,
    `users/first-user/workspaces/${workspaceId}/tasks/${taskId}`,
  )
  const gridRef = doc(
    firestore,
    `users/first-user/workspaces/${workspaceId}/grid/first-grid`,
  )
  if (dropped) {
    batch.update(facilityRef, { tasks: arrayUnion(taskId) })
  } else {
    batch.update(facilityRef, { tasks: arrayRemove(taskId) })
  }
  batch.update(taskRef, {
    dropped,
    facilityId: facilityId,
    startTime: Number(colId),
  })
  batch.update(gridRef, {
    cells: gridState.cells,
  })
  await batch.commit()
}

export const moveTaskInFirestore = async (
  taskId: string,
  sourceFacilityId: string,
  facilityId: string,
  colId: string,
  gridState: GridType,
  workspaceId: string,
) => {
  const batch = writeBatch(firestore)
  const taskRef = doc(
    firestore,
    `users/first-user/workspaces/${workspaceId}/tasks/${taskId}`,
  )
  const facilityRef = doc(
    firestore,
    `users/first-user/workspaces/${workspaceId}/facilities/${facilityId}`,
  )
  const sourceFacilityRef = doc(
    firestore,
    `users/first-user/workspaces/${workspaceId}/facilities/${sourceFacilityId}`,
  )
  const gridRef = doc(
    firestore,
    `users/first-user/workspaces/${workspaceId}/grid/first-grid`,
  )
  batch.update(taskRef, {
    facilityId,
    startTime: Number(colId),
  })
  if (sourceFacilityId !== facilityId) {
    batch.update(facilityRef, { tasks: arrayUnion(taskId) })
    batch.update(sourceFacilityRef, {
      tasks: arrayRemove(taskId),
    })
  }
  batch.update(gridRef, {
    cells: gridState.cells,
  })
  await batch.commit()
}

export const updateTaskInFirestore = async (
  id: string,
  updateData: { [key: string]: any },
  workspaceId: string,
) => {
  await updateDoc(
    doc(firestore, `users/first-user/workspaces/${workspaceId}/tasks/${id}`),
    updateData,
  )
}

const deleteTaskFromFirestore = async (
  taskId: string,
  workspaceId: string,
  facilityId?: string,
) => {
  await deleteDoc(
    doc(
      firestore,
      `users/first-user/workspaces/${workspaceId}/tasks/${taskId}`,
    ),
  )
  if (facilityId) {
    await updateDoc(
      doc(
        firestore,
        `users/first-user/workspaces/${workspaceId}/facilities/${facilityId}`,
      ),
      {
        tasks: arrayRemove(taskId),
      },
    )
  }
}

const fetchTasks = async (workspaceId: string) => {
  const tasks: { [id: string]: Task } = {}
  const querySnapshot = await getDocs(
    collection(firestore, `users/first-user/workspaces/${workspaceId}/tasks`),
  )
  querySnapshot.forEach((doc) => {
    tasks[doc.id] = doc.data() as Task
  })
  return tasks
}

export function* fetchTasksSaga() {
  try {
    const selectedWorkspaceId: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    const tasks: { [key: string]: Task } = yield call(
      fetchTasks,
      selectedWorkspaceId,
    )
    yield put(setTasks(tasks))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* addTaskSaga(
  action: PayloadAction<{ task: Task; workspaceId: string }>,
) {
  try {
    yield put(upsertTask(action.payload.task))
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
    const selectedWorkspaceId: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    if (facilityId && colId && cellSpan) {
      yield put(
        removeCells({ rowId: facilityId, colId, duration: Number(cellSpan) }),
      )
    }
    yield call(deleteTaskFromFirestore, taskId, selectedWorkspaceId, facilityId)
    yield put(
      setToastOpen({ message: "Usunięto zadanie", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* setTaskDroppedSaga(
  action: PayloadAction<{
    dropped: boolean
    rowId: string
    colId: string
    task: Task
  }>,
): Generator<any, void, any> {
  try {
    const { dropped, rowId, colId, task } = action.payload
    const { id: taskId, duration } = task
    const selectedWorkspaceId: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    yield put(setDraggedTask({ draggableId: null, task: null }))
    if (dropped) {
      yield put(setCellsOccupied({ rowId, colId, task }))
      yield put(assignTaskToFacility({ facilityId: rowId, taskId }))
      yield put(
        updateTask({
          id: taskId,
          data: { dropped, facilityId: rowId, startTime: Number(colId) },
        }),
      )
    } else {
      yield put(removeCells({ rowId, colId, duration }))
      yield put(removeTaskFromFacility({ facilityId: rowId, taskId }))
      yield put(
        updateTask({
          id: taskId,
          data: { dropped, facilityId: null, startTime: null },
        }),
      )
    }
    const gridState: GridType = yield select((state) => state.grid.grid)
    yield call(
      setTaskDroppedInFirestore,
      task.id,
      dropped,
      rowId,
      colId,
      gridState,
      selectedWorkspaceId,
    )
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
    task: Task
  }>,
): Generator<any, void, any> {
  const { sourceRowId, sourceColId, rowId, colId, task } = action.payload
  const { duration, id: taskId } = task
  const selectedWorkspaceId: string = yield select(
    (state) => state.workspaces.selectedWorkspace,
  )
  try {
    yield put(setDraggedTask({ draggableId: null, task: null }))
    yield put(
      removeCells({
        rowId: sourceRowId,
        colId: sourceColId,
        duration: duration,
      }),
    )
    yield put(removeTaskFromFacility({ facilityId: sourceRowId, taskId }))
    yield put(setCellsOccupied({ rowId, colId, task }))
    yield put(assignTaskToFacility({ facilityId: rowId, taskId }))
    yield put(
      updateTask({
        id: taskId,
        data: { facilityId: rowId, startTime: Number(colId) },
      }),
    )
    if (sourceRowId !== rowId) {
      yield put(removeTaskFromFacility({ facilityId: sourceRowId, taskId }))
      yield put(assignTaskToFacility({ facilityId: rowId, taskId }))
    }

    const gridState = yield select((state) => state.grid.grid)
    yield call(
      moveTaskInFirestore,
      taskId,
      sourceRowId,
      rowId,
      colId,
      gridState,
      selectedWorkspaceId,
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* setTaskDraggedSaga(
  action: PayloadAction<{ task: Task; cellId: string; dragged: boolean }>,
): Generator<any, void, any> {
  const { task, cellId, dragged } = action.payload
  yield put(setTaskDraggedInCell({ cellId, task, dragged }))
  yield put(setTaskDragged({ task, dragged }))
}

export function* updateTaskSaga(
  action: PayloadAction<{ id: string; data: any }>,
): Generator<any, void, any> {
  try {
    const { id, data } = action.payload
    const selectedWorkspaceId: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    yield put(updateTask({ id, data }))
    yield call(updateTaskInFirestore, id, data, selectedWorkspaceId)
    yield put(
      setToastOpen({ message: "Zaktualizowano zadanie", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "success" }))
  }
}

export function* syncTasksSaga() {
  const selectedWorkspaceId: string = yield select(
    (state) => state.workspaces.selectedWorkspace,
  )
  const colRef = collection(
    firestore,
    `users/first-user/workspaces/${selectedWorkspaceId}/tasks`,
  )
  const channel = eventChannel((emitter) => {
    const unsubscribe = onSnapshot(colRef, async () => {
      const snapshot = await getDocs(colRef)
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
      const prevTasks: { [key: string]: Task } = yield select(
        (state) => state.tasks.tasks,
      )
      let prevTasksCopy: { [key: string]: Task } = JSON.parse(
        JSON.stringify(prevTasks),
      )
      Object.values(prevTasksCopy).forEach((task) => {
        delete prevTasksCopy[task.id].dragged
      })
      if (hashObject(prevTasksCopy) !== hashObject(tasks)) {
        yield put(setTasks(tasks))
      }
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

function* watchSetTaskDragged() {
  yield takeLatest(setTaskDraggedStart.type, setTaskDraggedSaga)
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
    watchSetTaskDragged(),
    watchUpdateTask(),
  ])
}
