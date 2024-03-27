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
  Facility,
  removeTaskFromFacility,
} from "../slices/facilities"
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
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
  updateTask,
  upsertTask,
  resizeTaskStart,
  taskId,
  removeTask,
  updateRequiredTasks,
  updateRequiredByTasks,
  setTaskLockedStart,
} from "../slices/tasks"
import { setToastOpen } from "../slices/toast"
import {
  GridType,
  removeCells,
  setCellsOccupied,
  updateGridStart,
} from "../slices/grid"

import { userId } from "../slices/user"
import { projectId } from "../slices/projects"
import { selectGrid } from "../selectors/grid"
import { workspaceId } from "../slices/workspaces"

import { selectFacility } from "../selectors/facilities"

const addTaskToFirestore = async ({
  userId,
  task,
  workspaceId,
}: {
  userId: string
  task: Task
  workspaceId: string
}) => {
  await setDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/tasks/${task.id}`,
    ),
    task,
  )
}

export const undropMultipleTasksInFirestore = async (
  userId: string,
  tasks: { [id: taskId]: Task },
) => {
  const batch = writeBatch(firestore)
  for (const task of Object.values(tasks)) {
    const docRef = doc(
      firestore,
      `users/${userId}/workspaces/${task.workspaceId}/tasks/${task.id}`,
    )
    batch.update(docRef, { startTime: null, facilityId: null, dropped: false })
  }
  await batch.commit()
}

export const updateRequiredTasksInFirestore = async (
  requiredTasks: taskId[],
  workspaceId: workspaceId,
  userId: string,
  taskId: taskId,
) => {
  const batch = writeBatch(firestore)
  for (const requiredTaskId of requiredTasks) {
    const docRef = doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/tasks/${requiredTaskId}`,
    )
    batch.update(docRef, { requiredByTasks: arrayUnion(taskId) })
  }
  await batch.commit()
}

export const updateRequiredByTasksInFirestore = async (
  requiredByTasks: taskId[],
  workspaceId: workspaceId,
  userId: string,
  taskId: taskId,
) => {
  const batch = writeBatch(firestore)
  for (const requiredByTaskId of requiredByTasks) {
    const docRef = doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/tasks/${requiredByTaskId}`,
    )
    batch.update(docRef, { requiredTasks: arrayRemove(taskId) })
  }
  await batch.commit()
}

export const setTaskDroppedInFirestore = async (
  userId: string,
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
    `users/${userId}/workspaces/${workspaceId}/facilities/${facilityId}`,
  )
  const taskRef = doc(
    firestore,
    `users/${userId}/workspaces/${workspaceId}/tasks/${taskId}`,
  )
  const gridRef = doc(
    firestore,
    `users/${userId}/workspaces/${workspaceId}/grid/first-grid`,
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
  userId: string,
  taskId: string,
  sourceFacilityId: string,
  facilityId: string,
  colId: string,
  grid: GridType,
  workspaceId: string,
) => {
  const batch = writeBatch(firestore)
  const taskRef = doc(
    firestore,
    `users/${userId}/workspaces/${workspaceId}/tasks/${taskId}`,
  )
  const facilityRef = doc(
    firestore,
    `users/${userId}/workspaces/${workspaceId}/facilities/${facilityId}`,
  )
  const sourceFacilityRef = doc(
    firestore,
    `users/${userId}/workspaces/${workspaceId}/facilities/${sourceFacilityId}`,
  )
  const gridRef = doc(
    firestore,
    `users/${userId}/workspaces/${workspaceId}/grid/first-grid`,
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
    cells: grid.cells,
  })
  await batch.commit()
}

export const resizeTaskInFirestore = async (
  userId: string,
  taskId: string,
  workspaceId: string,
  newDuration: number,
  grid: GridType,
) => {
  const batch = writeBatch(firestore)
  const taskRef = doc(
    firestore,
    `users/${userId}/workspaces/${workspaceId}/tasks/${taskId}`,
  )
  const gridRef = doc(
    firestore,
    `users/${userId}/workspaces/${workspaceId}/grid/first-grid`,
  )
  batch.update(taskRef, {
    duration: newDuration,
  })
  batch.update(gridRef, {
    cells: grid.cells,
  })
  await batch.commit()
}

export const updateTaskInFirestore = async (
  userId: string,
  taskId: string,
  updateData: { [key: string]: any },
  workspaceId: string,
) => {
  await updateDoc(
    doc(firestore, `users/${userId}/workspaces/${workspaceId}/tasks/${taskId}`),
    updateData,
  )
}

const deleteTaskFromFirestore = async (
  userId: string,
  taskId: string,
  workspaceId: string,
  facilityId?: string | null,
) => {
  await deleteDoc(
    doc(firestore, `users/${userId}/workspaces/${workspaceId}/tasks/${taskId}`),
  )
  if (facilityId) {
    await updateDoc(
      doc(
        firestore,
        `users/${userId}/workspaces/${workspaceId}/facilities/${facilityId}`,
      ),
      {
        tasks: arrayRemove(taskId),
      },
    )
  }
}

export function* addTaskSaga(
  action: PayloadAction<{ task: Task; workspaceId: string }>,
) {
  try {
    const { task, workspaceId } = action.payload
    const userId: string = yield select((state) => state.user.user.id)
    yield put(upsertTask(task))
    if (task.requiredTasks.length > 0) {
      yield put(
        updateRequiredTasks({
          requiredTasks: task.requiredTasks,
          projectId: task.projectId,
          taskId: task.id,
        }),
      )
    }
    yield call(addTaskToFirestore, {
      task,
      workspaceId,
      userId,
    })
    if (task.requiredTasks.length > 0) {
      yield call(
        updateRequiredTasksInFirestore,
        task.requiredTasks,
        workspaceId,
        userId,
        task.id,
      )
    }
    yield put(setToastOpen({ message: "Dodano zadanie", severity: "success" }))
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* deleteTaskSaga(
  action: PayloadAction<{
    task: Task
  }>,
): Generator<any, void, any> {
  try {
    const { task } = action.payload
    const userId: userId = yield select((state) => state.user.user?.id)
    const workspaceId: workspaceId = task.workspaceId
    const facilityId = task.facilityId
    const colId = task.startTime?.toString()
    const facility = yield select((state) =>
      selectFacility(state, workspaceId, facilityId),
    )

    const taskId = task.id
    const cellSpan = task.duration

    if (facilityId && colId && cellSpan) {
      yield put(
        removeCells({
          facility: facility,
          colId: colId,
          duration: Number(cellSpan),
          workspaceId,
        }),
      )
    }
    if (task.requiredByTasks.length > 0) {
      yield put(
        updateRequiredByTasks({
          requiredByTasks: task.requiredByTasks,
          taskId: task.id,
          projectId: task.projectId,
        }),
      )
    }
    yield put(removeTask(task))
    yield call(deleteTaskFromFirestore, userId, taskId, workspaceId, facilityId)
    yield put(
      setToastOpen({ message: "Usunięto zadanie", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: error.message, severity: "error" }))
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
    const duration = task.duration
    const workspaceId = task.workspaceId
    const userId: string = yield select((state) => state.user.user?.id)
    const facility: Facility = yield select((state) =>
      selectFacility(state, workspaceId, rowId),
    )
    if (dropped) {
      yield put(setCellsOccupied({ facility, colId, task, workspaceId }))
      yield put(assignTaskToFacility({ facilityId: rowId, task }))
      yield put(
        updateTask({
          task,
          data: { dropped, facilityId: rowId, startTime: Number(colId) },
        }),
      )
    } else {
      yield put(removeCells({ facility, colId, duration, workspaceId }))
      yield put(removeTaskFromFacility({ facilityId: rowId, task }))
      yield put(
        updateTask({
          task,
          data: { dropped, facilityId: null, startTime: null },
        }),
      )
    }
    const gridState: GridType = yield select((state) =>
      selectGrid(state, workspaceId),
    )
    yield call(
      setTaskDroppedInFirestore,
      userId,
      task.id,
      dropped,
      rowId,
      colId,
      gridState,
      workspaceId,
    )
  } catch (error) {
    yield put(
      setToastOpen({ message: "Error dropping task", severity: "error" }),
    )
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
  const duration = task.duration

  const taskId = task.id
  const userId: string = yield select((state) => state.user.user?.id)
  const workspaceId = task.workspaceId
  const facility = yield select((state) =>
    selectFacility(state, workspaceId, rowId),
  )
  const sourceFacility = yield select((state) =>
    selectFacility(state, workspaceId, sourceRowId),
  )

  try {
    yield put(
      removeCells({
        facility: sourceFacility,
        colId: sourceColId,
        duration: duration,
        workspaceId,
      }),
    )
    yield put(removeTaskFromFacility({ facilityId: sourceRowId, task }))
    yield put(setCellsOccupied({ facility, colId, task, workspaceId }))
    yield put(assignTaskToFacility({ facilityId: rowId, task }))
    yield put(
      updateTask({
        task: task,
        data: { facilityId: rowId, startTime: Number(colId), dropped: true },
      }),
    )
    if (sourceRowId !== rowId) {
      yield put(removeTaskFromFacility({ facilityId: sourceRowId, task }))
      yield put(assignTaskToFacility({ facilityId: rowId, task }))
    }

    const grid: GridType = yield select((state) =>
      selectGrid(state, workspaceId),
    )
    yield call(
      moveTaskInFirestore,
      userId,
      taskId,
      sourceRowId,
      rowId,
      colId,
      grid,
      workspaceId,
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* resizeTaskSaga(
  action: PayloadAction<{
    cellId: string
    task: Task
    newDuration: number
  }>,
) {
  const { cellId, task, newDuration } = action.payload

  const [rowId, colId] = cellId.split("-")
  //get newColId based on the newDuration as days in miliseconds
  try {
    const workspaceId: workspaceId = task.workspaceId
    const userId: string = yield select((state) => state.user.user?.id)
    const facility: Facility = yield select((state) =>
      selectFacility(state, workspaceId, rowId),
    )
    yield put(
      updateTask({ task, data: { duration: newDuration, dropped: true } }),
    )
    yield put(
      removeCells({
        facility,
        duration: task.duration,
        colId: colId,
        workspaceId,
      }),
    )
    yield put(
      setCellsOccupied({
        facility,
        colId: colId,
        task: {
          ...task,
          duration: newDuration,
          dropped: true,
        },
        workspaceId,
      }),
    )

    const grid: GridType = yield select((state) =>
      selectGrid(state, workspaceId),
    )
    yield call(
      resizeTaskInFirestore,
      userId,
      task.id,
      workspaceId,
      newDuration,
      grid,
    )
  } catch (error) {
    yield put(
      setToastOpen({ message: "Error resizing task", severity: "error" }),
    )
  }
}

export function* updateTaskSaga(
  action: PayloadAction<{ task: Task; data: any; workspaceId: workspaceId }>,
): Generator<any, void, any> {
  try {
    const { task, data, workspaceId } = action.payload
    const id = task.id
    const requiredTasks = data.requiredTasks
    const userId: string = yield select((state) => state.user.user?.id)
    yield put(updateTask({ task, data }))
    if (requiredTasks.length > 0) {
      yield put(
        updateRequiredTasks({
          requiredTasks: requiredTasks,
          taskId: id,
          projectId: task.projectId,
        }),
      )
    }
    const grid: GridType = yield select((state) =>
      selectGrid(state, workspaceId),
    )
    yield call(updateGridStart, grid)
    yield call(updateTaskInFirestore, userId, id, data, task.workspaceId)
    if (requiredTasks.length > 0) {
      yield call(
        updateRequiredTasksInFirestore,
        requiredTasks,
        workspaceId,
        userId,
        task.id,
      )
    }
    yield put(
      setToastOpen({
        message: "Zaktualizowano zadanie",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: error.message, severity: "error" }))
  }
}

export function* setTaskLockedSaga(
  action: PayloadAction<{ task: Task; locked: boolean }>,
) {
  const { task, locked } = action.payload
  const userId: string = yield select((state) => state.user.user?.id)
  try {
    yield put(updateTask({ task, data: { locked } }))
    yield call(
      updateTaskInFirestore,
      userId,
      task.id,
      { locked },
      task.workspaceId,
    )
  } catch (error) {
    console.info(error)
  }
}

export function* syncTasksSaga() {
  const userId: userId = yield select((state) => state.user.user?.id)
  const prevTasks: { [id: projectId]: { [id: taskId]: Task } } = yield select(
    (state) => state.tasks.tasks,
  )
  if (!userId) return

  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, `users/${userId}/workspaces`)

    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      snapshot.forEach((workspaceDoc) => {
        const workspaceId = workspaceDoc.id
        const projectsRef = collection(
          firestore,
          `users/${userId}/workspaces/${workspaceId}/tasks`,
        )
        onSnapshot(projectsRef, async (projectsSnapshot) => {
          const newTasks = { ...prevTasks }
          projectsSnapshot.forEach((doc) => {
            const task = doc.data() as Task
            if (!newTasks[task.projectId]) {
              newTasks[task.projectId] = {}
            }
            newTasks[task.projectId] = {
              ...newTasks[task.projectId],
              [task.id]: task,
            }
          })
          emitter(newTasks)
        })
      })
    })

    return unsubscribe
  })

  try {
    while (true) {
      const tasks: { [id: string]: { [id: string]: Task } } = yield take(
        channel,
      )
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

function* watchResizeTask() {
  yield takeLatest(resizeTaskStart.type, resizeTaskSaga)
}

function* watchSetTaskLocked() {
  yield takeLatest(setTaskLockedStart.type, setTaskLockedSaga)
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
    watchSetTaskLocked(),
    watchResizeTask(),
    watchUpdateTask(),
  ])
}
