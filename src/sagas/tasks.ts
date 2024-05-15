import { PayloadAction } from "@reduxjs/toolkit"
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
import {
  assignTaskToFacility,
  Condition,
  Facility,
  facilityId,
  removeTaskFromFacility,
} from "../slices/facilities"
import {
  GridType,
  removeCells,
  setCellsOccupied,
  updateGridStart,
} from "../slices/grid"
import {
  addTaskStart,
  deleteTaskStart,
  moveTaskStart,
  removeTask,
  resizeTaskStart,
  setCollabTasks,
  setTaskDroppedStart,
  setTaskLockedStart,
  setTasks,
  syncCollabTasksStart,
  syncTasksStart,
  Task,
  taskId,
  updateRequiredByTasks,
  updateRequiredTasks,
  updateTask,
  updateTaskStart,
  upsertTask,
} from "../slices/tasks"
import { setToastOpen } from "../slices/toast"

import { FormikHelpers } from "formik"
import _ from "lodash"
import React from "react"
import { TaskFormData } from "../components/CreateTaskModal"
import { calculateTaskDurationHelper } from "../components/DataGrid/calculateTaskDurationHelper"
import { Modal } from "../components/DataPanel"
import { selectFacility } from "../selectors/facilities"
import { selectGrid } from "../selectors/grid"
import { selectProject } from "../selectors/projects"
import { setDragDisabled } from "../slices/drag"
import { Invite } from "../slices/invites"
import { Project, projectId, setProjectAttributes } from "../slices/projects"
import { userId } from "../slices/user"
import { ParentAttributes, workspaceId } from "../slices/workspaces"
import { updateGridInFirestore } from "./grid"
import { updateProjectInFirestore } from "./projects"

interface CustomError extends Error {
  statusCode?: number
}

const checkConditions = (
  conditions: Condition[],
  task: Task,
  facility: Facility,
) => {
  if (!conditions) return true
  for (const condition of conditions) {
    const taskAttribute = condition.taskAttribute
    const operator = condition.operator
    const facilityAttribute = condition.facilityAttribute
    const taskAttributeValue = task.attributes[taskAttribute].value
    const facilityAttributeValue = facility.attributes[facilityAttribute].value

    switch (operator) {
      case "==":
        if (taskAttributeValue !== facilityAttributeValue) return false
        break
      case "!=":
        if (taskAttributeValue == facilityAttributeValue) return false
    }
  }
  return true
}

const checkCanDropTask = (grid: GridType, facility: Facility, task: Task) => {
  const actualDuration = calculateTaskDurationHelper({
    manpower: facility.manpower,
    duration: task.duration,
  })

  const increment = 1000 * 60 * 60 * 24
  const cells = grid.cells
  for (let i = 0; i < actualDuration * increment; i += increment) {
    const cellId = `${facility.id}-${Number(task.startTime) + i}`
    if (cellId in cells) {
      const cell = cells[cellId]!
      if (cell.taskId !== task.id) {
        return false
      }
    }
  }

  return true
}

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
    batch.update(docRef, { startTime: null, facilityId: null })
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
    batch.update(taskRef, {
      dropped,
      facilityId: facilityId,
      startTime: Number(colId),
    })
  } else {
    batch.update(facilityRef, { tasks: arrayRemove(taskId) })
    batch.update(taskRef, {
      dropped,
      facilityId: null,
      startTime: null,
    })
  }

  batch.update(gridRef, {
    cells: gridState.cells,
  })
  await batch.commit()
}

export const moveTaskInFirestore = async (
  userId: userId,
  taskId: taskId,
  sourceFacilityId: facilityId,
  facilityId: facilityId,
  colId: string,
  grid: GridType,
  workspaceId: workspaceId,
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
  userId: userId,
  taskId: taskId,
  workspaceId: workspaceId,
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
  userId: userId,
  taskId: taskId,
  updateData: Partial<Task>,
  workspaceId: workspaceId,
) => {
  await updateDoc(
    doc(firestore, `users/${userId}/workspaces/${workspaceId}/tasks/${taskId}`),
    updateData,
  )
}

const deleteTaskFromFirestore = async (
  userId: userId,
  taskId: taskId,
  workspaceId: workspaceId,
  facilityId?: facilityId | null,
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
  action: PayloadAction<{
    task: Task
    projectAttributes: ParentAttributes
    workspaceId: workspaceId
    resetForm: FormikHelpers<TaskFormData>["resetForm"]
    setModal: React.Dispatch<React.SetStateAction<Modal | null>>
  }>,
) {
  try {
    const { task, projectAttributes, workspaceId, setModal, resetForm } =
      action.payload
    const projectId = task.projectId
    const project: Project = yield select((state) =>
      selectProject(state, workspaceId, projectId),
    )
    const userId = project.ownerId

    const grid: GridType = yield select((state) =>
      selectGrid(state, workspaceId),
    )
    const facility: Facility = yield select((state) =>
      selectFacility(state, workspaceId, task.facilityId),
    )
    if (facility) {
      const canDrop = checkCanDropTask(grid, facility, task)
      const conditions = facility.conditions[task.projectId]
      const areConditionsMet = checkConditions(conditions, task, facility)
      if (!areConditionsMet) {
        throw Object.assign(new Error("Nie spełniono warunków"), {
          statusCode: 111,
        })
      } else if (!canDrop) {
        throw Object.assign(new Error("Wykryto kolizję"), { statusCode: 110 })
      } else if (task.startTime && task.facilityId && facility) {
        yield put(
          setCellsOccupied({
            facility,
            colId: task.startTime,
            task: task,
            workspaceId,
          }),
        )
        const gridState: GridType = yield select((state) =>
          selectGrid(state, workspaceId),
        )

        yield call(updateGridInFirestore, userId, gridState, workspaceId)
      }
    }

    yield put(
      setProjectAttributes({
        projectId: task.projectId,
        attributes: projectAttributes,
        workspaceId,
      }),
    )
    yield call(
      updateProjectInFirestore,
      userId,
      task.workspaceId,
      task.projectId,
      { taskAttributes: projectAttributes },
    )

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
    setModal(null)
    resetForm()
    yield put(setDragDisabled(false))
    yield put(setToastOpen({ message: "Dodano zadanie", severity: "success" }))
  } catch (error) {
    const customError = error as { statusCode?: number }
    if (customError.statusCode === 110) {
      yield put(
        setToastOpen({
          message: "Nie można dodać zadania, wykryto kolizję",
          severity: "error",
        }),
      )
    } else {
      yield put(
        setToastOpen({
          message: "Nie można dodać zadania, wystąpił błąd",
          severity: "error",
        }),
      )
    }
  }
}

export function* deleteTaskSaga(
  action: PayloadAction<{
    task: Task
  }>,
): Generator<any, void, any> {
  try {
    const { task } = action.payload
    const project: Project = yield select((state) =>
      selectProject(state, task.workspaceId, task.projectId),
    )
    const userId = project.ownerId
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
    const duration = task.duration
    const workspaceId = task.workspaceId
    const project: Project = yield select((state) =>
      selectProject(state, task.workspaceId, task.projectId),
    )
    const userId = project.ownerId
    const facility: Facility = yield select((state) =>
      selectFacility(state, workspaceId, rowId),
    )
    if (dropped) {
      yield put(setCellsOccupied({ facility, colId, task, workspaceId }))
      yield put(assignTaskToFacility({ facilityId: rowId, task }))
      yield put(
        updateTask({
          task,
          data: {
            facilityId: rowId,
            startTime: Number(colId),
          },
        }),
      )
    } else {
      yield put(removeCells({ facility, colId, duration, workspaceId }))
      yield put(removeTaskFromFacility({ facilityId: rowId, task }))
      yield put(
        updateTask({
          task,
          data: {
            facilityId: null,
            startTime: null,
          },
        }),
      )
      yield call(
        updateTaskInFirestore,
        userId,
        task.id,
        { facilityId: null, startTime: null },
        workspaceId,
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
  const project: Project = yield select((state) =>
    selectProject(state, task.workspaceId, task.projectId),
  )
  const userId = project.ownerId
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
  console.log(newDuration)
  const [rowId, colId] = cellId.split("-")
  //get newColId based on the newDuration as days in miliseconds
  try {
    const workspaceId: workspaceId = task.workspaceId
    const project: Project = yield select((state) =>
      selectProject(state, task.workspaceId, task.projectId),
    )
    const userId = project.ownerId
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
  action: PayloadAction<{
    task: Task
    data: any
    projectAttributes: ParentAttributes
    workspaceId: workspaceId
    setModal: React.Dispatch<React.SetStateAction<Modal | null>>
    resetForm: FormikHelpers<TaskFormData>["resetForm"]
  }>,
): Generator<any, void, any> {
  try {
    const { task, data, projectAttributes, workspaceId, setModal, resetForm } =
      action.payload
    const id = task.id
    const requiredTasks = data.requiredTasks
    const project: Project = yield select((state) =>
      selectProject(state, task.workspaceId, task.projectId),
    )
    const userId = project.ownerId
    const prevGrid: GridType = yield select((state) =>
      selectGrid(state, workspaceId),
    )
    const prevFacility: Facility = yield select((state) =>
      selectFacility(state, workspaceId, task.facilityId),
    )
    const newFacility: Facility = yield select((state) =>
      selectFacility(state, workspaceId, data.facilityId),
    )

    if (newFacility) {
      const canDrop = checkCanDropTask(prevGrid, newFacility, data)
      const conditions = newFacility.conditions[task.projectId]
      const areConditionsMet = checkConditions(conditions, task, newFacility)
      if (!areConditionsMet) {
        throw Object.assign(new Error("Nie spełniono warunków"), {
          statusCode: 111,
        })
      } else if (!canDrop) {
        throw Object.assign(new Error("Wykryto kolizję"), { statusCode: 110 })
      }
      if (
        task.startTime &&
        task.facilityId &&
        (data.startTime !== task.startTime ||
          data.facilityId !== task.facilityId)
      ) {
        yield put(
          removeCells({
            facility: prevFacility,
            colId: task.startTime,
            duration: task.duration,
            workspaceId,
          }),
        )
      }
      if (
        data.facilityId &&
        data.startTime &&
        (data.startTime !== task.startTime ||
          data.facilityId !== task.facilityId)
      ) {
        yield put(
          setCellsOccupied({
            facility: newFacility,
            colId: data.startTime,
            task: data,
            workspaceId,
          }),
        )
      }
    }
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

    yield put(
      setProjectAttributes({
        projectId: task.projectId,
        attributes: projectAttributes,
        workspaceId,
      }),
    )
    yield call(
      updateProjectInFirestore,
      userId,
      task.workspaceId,
      task.projectId,
      { taskAttributes: projectAttributes },
    )

    if (requiredTasks.length > 0) {
      yield call(
        updateRequiredTasksInFirestore,
        requiredTasks,
        workspaceId,
        userId,
        task.id,
      )
    }
    resetForm()
    setModal(null)
    yield put(setDragDisabled(false))
    yield put(
      setToastOpen({
        message: "Zaktualizowano zadanie",
        severity: "success",
      }),
    )
  } catch (error) {
    const customError = error as CustomError
    if (customError.statusCode === 110) {
      yield put(
        setToastOpen({
          message: "Nie można zaktualizować zadania, wykryto kolizję",
          severity: "error",
        }),
      )
    } else {
      yield put(
        setToastOpen({
          message: customError.message,
          severity: "error",
        }),
      )
    }
  }
}

export function* setTaskLockedSaga(
  action: PayloadAction<{ task: Task; locked: boolean }>,
) {
  const { task, locked } = action.payload
  const project: Project = yield select((state) =>
    selectProject(state, task.workspaceId, task.projectId),
  )
  const userId = project.ownerId
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

export function* syncCollabTasksSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  const invites: { [key: string]: Invite } = yield select(
    (state) => state.invites.invites,
  )

  if (!userId || Object.keys(invites).length === 0) return

  const channels: EventChannel<Task[]>[] = Object.values(invites).map(
    (invite) => {
      return eventChannel((emitter) => {
        const colRef = collection(
          firestore,
          `users/${invite.invitingUserId}/workspaces/${invite.workspaceId}/tasks`,
        )
        const unsubscribe = onSnapshot(colRef, async () => {
          const snapshot = await getDocs(colRef)
          const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            inviteId: invite.id,
            ...doc.data(),
          })) as Task[]
          emitter(tasks)
        })
        return unsubscribe
      })
    },
  )

  try {
    while (true) {
      const results: Task[][] = yield race(
        channels.map((channel) => take(channel)),
      )
      for (const result of results) {
        if (result) {
          const tasks: Task[] = result
          yield put(setCollabTasks(tasks))
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

function* watchSyncCollabTasks() {
  yield takeLatest(syncCollabTasksStart.type, syncCollabTasksSaga)
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
    watchSyncCollabTasks(),
  ])
}
