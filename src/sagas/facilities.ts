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
  Facility,
  addFacilityStart,
  setFacilities,
  deleteFacilityStart,
  syncFacilitiesStart,
  updateFacilityStart,
  facilityId,
  upsertFacility,
  removeFacility,
  updateFacility,
} from "../slices/facilities"
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { setToastOpen } from "../slices/toast"
import { removeFacilityFromGrid } from "../slices/grid"
import { undropMultipleTasksInFirestore } from "./tasks"
import CryptoJS from "crypto-js"
import { userId } from "../slices/user"
import { workspaceId } from "../slices/workspaces"
import { projectId } from "../slices/projects"
import { Task, taskId, undropMultipleTasks } from "../slices/tasks"
import {
  selectTasks,
  selectTasksByIds,
  selectTasksByIdsInWorkspace,
} from "../selectors/tasks"

function stableStringify(obj: object) {
  const allKeys: string[] = []
  JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      allKeys.push(key)
    }
    return value
  })
  allKeys.sort()
  return JSON.stringify(obj, allKeys)
}

export const hashObject = (obj: object) => {
  const stableString = stableStringify(obj)
  return CryptoJS.MD5(stableString).toString()
}

export const addFacilityToFirestore = async (
  userId: userId,
  facility: Facility,
) => {
  await setDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${facility.workspaceId}/facilities/${facility.id}`,
    ),
    facility,
  )
}

export const deleteFacilityFromFirestore = async (
  userId: userId,
  facilityId: facilityId,
  workspaceId: workspaceId,
) => {
  await deleteDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/facilities/${facilityId}`,
    ),
  )
}

export const assignTaskToFacilityInFirestore = async (
  userId: userId,
  facilityId: facilityId,
  taskId: taskId,
  workspaceId: workspaceId,
) => {
  await updateDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/facilities/${facilityId}`,
    ),
    {
      tasks: arrayUnion(taskId),
    },
  )
}

export const updateFacilityInFirestore = async (
  userId: userId,
  taskId: taskId,
  updateData: { [key: facilityId]: any },
  workspaceId: workspaceId,
) => {
  await updateDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/facilities/${taskId}`,
    ),
    updateData,
  )
}

export const removeTaskFromFacilityInFirestore = async (
  userId: userId,
  facilityId: facilityId,
  taskId: taskId,
  workspaceId: workspaceId,
) => {
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

export function* updateFacilitySaga(
  action: PayloadAction<{ facility: Facility; data: any }>,
): Generator<any, void, any> {
  try {
    const { facility, data } = action.payload
    const facilityId: facilityId = facility.id
    const userId: userId = yield select((state) => state.user.user?.id)
    const workspaceId: workspaceId = yield select(
      (state) => state.user.user?.openWorkspaceId,
    )
    yield put(updateFacility({ facility, data }))
    yield call(updateFacilityInFirestore, userId, facilityId, data, workspaceId)
    yield put(
      setToastOpen({
        message: "Zaktualizowano stanowisko",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* addFacilitySaga(action: PayloadAction<Facility>) {
  try {
    const userId: userId = yield select((state) => state.user.user?.id)
    yield put(upsertFacility(action.payload))
    yield call(addFacilityToFirestore, userId, action.payload)
    yield put(
      setToastOpen({
        message: "Facility added successfully",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(
      setToastOpen({
        message: "Error adding facility",
        severity: "error",
      }),
    )
  }
}

export function* deleteFacilitySaga(
  action: PayloadAction<Facility>,
): Generator<any, void, any> {
  try {
    const { id: facilityId, tasks: taskIds } = action.payload
    const userId: userId = yield select((state) => state.user.user?.id)
    const workspaceId: workspaceId = yield select(
      (state) => state.user.user?.openWorkspaceId,
    )
    const tasks: { [id: taskId]: Task } = yield select((state) =>
      selectTasksByIdsInWorkspace(state, workspaceId, taskIds),
    )
    yield put(undropMultipleTasks({ tasks }))
    yield put(removeFacility({ facilityId: facilityId, workspaceId }))
    yield put(removeFacilityFromGrid({ facilityId, workspaceId }))
    yield call(undropMultipleTasksInFirestore, userId, tasks)
    yield call(deleteFacilityFromFirestore, userId, facilityId, workspaceId)
    yield put(
      setToastOpen({
        message: "Facility deleted successfully",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(
      setToastOpen({
        message: error.message,
        severity: "error",
      }),
    )
  }
}

export function* syncFacilitiesSaga() {
  const userId: userId = yield select((state) => state.user.user?.id)
  const prevFacilities: { [id: workspaceId]: { [id: facilityId]: Facility } } =
    yield select((state) => state.facilities.facilities)
  if (!userId) return

  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, `users/${userId}/workspaces`)

    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      snapshot.forEach((workspaceDoc) => {
        const workspaceId = workspaceDoc.id
        const projectsRef = collection(
          firestore,
          `users/${userId}/workspaces/${workspaceId}/facilities`,
        )
        onSnapshot(projectsRef, async (projectsSnapshot) => {
          const facilities = {} as { [id: facilityId]: Facility }
          projectsSnapshot.forEach(
            (doc: DocumentData) =>
              (facilities[doc.id] = {
                id: doc.id,
                ...doc.data(),
              } as Facility),
          )
          const sortedFacilities = Object.values(facilities)
            .sort((a, b) => a.bgcolor.localeCompare(b.bgcolor))
            .reduce((acc, facility, index) => {
              acc[facility.id] = {
                ...facility,
                index: index,
              }
              return acc
            }, {} as { [id: facilityId]: Facility })
          const allFacilities = {
            ...prevFacilities,
            [workspaceId]: sortedFacilities,
          }
          emitter(allFacilities)
        })
      })
    })

    return unsubscribe
  })

  try {
    while (true) {
      const facilities: { [id: workspaceId]: { [id: projectId]: Facility } } =
        yield take(channel)
      yield put(setFacilities(facilities))
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

export function* watchAddFacility() {
  yield takeLatest(addFacilityStart.type, addFacilitySaga)
}

function* watchDeleteFacility() {
  yield takeLatest(deleteFacilityStart.type, deleteFacilitySaga)
}

function* watchUpdateFacility() {
  yield takeLatest(updateFacilityStart.type, updateFacilitySaga)
}

function* watchSyncFacilities() {
  yield takeLatest(syncFacilitiesStart.type, syncFacilitiesSaga)
}

export default function* facilitiesSagas() {
  yield all([
    watchAddFacility(),
    watchDeleteFacility(),
    watchSyncFacilities(),
    watchUpdateFacility(),
  ])
}
