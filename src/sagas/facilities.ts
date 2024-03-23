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
} from "firebase/firestore"
import { setToastOpen } from "../slices/toast"
import { removeFacilityFromGrid } from "../slices/grid"
import { undropMultipleTasksInFirestore } from "./tasks"
import CryptoJS from "crypto-js"
import { userId } from "../slices/user"
import { workspaceId } from "../slices/workspaces"
import { projectId } from "../slices/projects"

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
  userId: string,
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
  userId: string,
  facilityId: string,
  workspaceId: string,
) => {
  await deleteDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/facilities/${facilityId}`,
    ),
  )
}

export const assignTaskToFacilityInFirestore = async (
  userId: string,
  facilityId: string,
  taskId: string,
  workspaceId: string,
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
  userId: string,
  taskId: string,
  updateData: { [key: string]: any },
  workspaceId: string,
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
  userId: string,
  facilityId: string,
  taskId: string,
  workspaceId: string,
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

const fetchFacilities = async (userId: string, workspaceId: string) => {
  const tasks: { [id: string]: Facility } = {}
  const querySnapshot = await getDocs(
    collection(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/facilities`,
    ),
  )
  querySnapshot.forEach((doc) => {
    tasks[doc.id] = doc.data() as Facility
  })
  return tasks
}

export function* updateFacilitySaga(
  action: PayloadAction<{ id: string; data: any }>,
): Generator<any, void, any> {
  try {
    const { id, data } = action.payload
    const userId: string = yield select((state) => state.user.user?.id)
    const selectedWorkspace: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    yield call(updateFacilityInFirestore, userId, id, data, selectedWorkspace)
    yield put(
      setToastOpen({
        message: "Zaktualizowano stanowisko",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "success" }))
  }
}

export function* addFacilitySaga(action: PayloadAction<Facility>) {
  try {
    const userId: string = yield select((state) => state.user.user?.id)
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
    const { id: facilityId, tasks } = action.payload
    const userId: string = yield select((state) => state.user.user?.uid)
    const selectedWorkspace: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    yield put(removeFacilityFromGrid({ facilityId }))
    yield call(undropMultipleTasksInFirestore, userId, tasks, selectedWorkspace)
    yield call(
      deleteFacilityFromFirestore,
      userId,
      facilityId,
      selectedWorkspace,
    )
    yield put(
      setToastOpen({
        message: "Facility deleted successfully",
        severity: "success",
      }),
    )
  } catch (error) {
    console.error("Error deleting task:", error)
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
            (doc) =>
              (facilities[doc.id] = {
                id: doc.id,
                ...doc.data(),
              } as Facility),
          )
          const newProjects = { ...prevFacilities, [workspaceId]: facilities }
          emitter(newProjects)
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
