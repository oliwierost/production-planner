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
  undropTasksFromFacilityStart,
  sortFacilities,
} from "../slices/facilities"
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
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
import { selectTasksByIdsInWorkspace } from "../selectors/tasks"
import { selectGrid } from "../selectors/grid"
import { updateGridInFirestore } from "./grid"

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
    const facilities: {
      [id: workspaceId]: {
        [id: facilityId]: Facility
      }
    } = yield select((state) => state.facilities.facilities)
    yield put(
      sortFacilities({
        facilities: facilities,
        workspaceId: facility.workspaceId,
      }),
    )
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
    const facility = action.payload
    yield put(upsertFacility(facility))
    yield call(addFacilityToFirestore, userId, facility)
    const facilities: {
      [id: workspaceId]: {
        [id: facilityId]: Facility
      }
    } = yield select((state) => state.facilities.facilities)
    yield put(
      sortFacilities({
        facilities: facilities,
        workspaceId: facility.workspaceId,
      }),
    )
    yield put(
      setToastOpen({
        message: "Dodano stanowisko",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(
      setToastOpen({
        message: "Wystąpił błąd podczas dodawania stanowiska",
        severity: "error",
      }),
    )
  }
}

export function* undropTasksFromFacilitySaga(
  action: PayloadAction<Facility>,
): Generator<any, void, any> {
  try {
    const facility: Facility = action.payload
    const userId: userId = yield select((state) => state.user.user?.id)
    const workspaceId: workspaceId = yield select(
      (state) => state.user.user?.openWorkspaceId,
    )
    const tasks: { [id: taskId]: Task } = yield select((state) =>
      selectTasksByIdsInWorkspace(state, workspaceId, facility.tasks),
    )
    yield put(updateFacility({ facility, data: { tasks: [] } }))
    yield put(removeFacilityFromGrid({ facilityId: facility.id, workspaceId }))
    yield put(undropMultipleTasks({ tasks }))
    const updatedGrid = yield select((state) => selectGrid(state, workspaceId))
    yield call(
      updateFacilityInFirestore,
      userId,
      facility.id,
      { tasks: [] },
      workspaceId,
    )
    yield call(updateGridInFirestore, userId, updatedGrid, workspaceId)
    yield call(undropMultipleTasksInFirestore, userId, tasks)
    yield put(
      setToastOpen({
        message: "Zadania usunięte z powodzeniem",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(
      setToastOpen({
        message: "Błąd podczas usuwania zadań",
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
    const updatedGrid = yield select((state) => selectGrid(state, workspaceId))
    const facilities: {
      [id: workspaceId]: {
        [id: facilityId]: Facility
      }
    } = yield select((state) => state.facilities.facilities)
    yield put(
      sortFacilities({
        facilities: facilities,
        workspaceId: workspaceId,
      }),
    )
    yield call(updateGridInFirestore, userId, updatedGrid, workspaceId)
    yield call(undropMultipleTasksInFirestore, userId, tasks)
    yield call(deleteFacilityFromFirestore, userId, facilityId, workspaceId)
    yield put(
      setToastOpen({
        message: "Usunięto stanowisko z powodzeniem",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(
      setToastOpen({
        message: "Błąd podczas usuwania stanowiska",
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
          const allFacilities = {
            ...prevFacilities,
            [workspaceId]: facilities,
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
      const allFacilities: {
        [id: workspaceId]: { [id: projectId]: Facility }
      } = yield select((state) => state.facilities.facilities)
      const workspaceId: workspaceId = yield select(
        (state) => state.user.user?.openWorkspaceId,
      )
      if (workspaceId && allFacilities[workspaceId]) {
        yield put(
          sortFacilities({
            facilities: allFacilities,
            workspaceId,
          }),
        )
      }
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

function* watchUndropTasksFromFacility() {
  yield takeLatest(
    undropTasksFromFacilityStart.type,
    undropTasksFromFacilitySaga,
  )
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
    watchUndropTasksFromFacility(),
    watchUpdateFacility(),
  ])
}
