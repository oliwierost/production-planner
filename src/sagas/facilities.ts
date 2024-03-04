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
//create object hashing helper function using crypto-js
const hashObject = (obj: object) => {
  return CryptoJS.SHA256(JSON.stringify(obj)).toString()
}

export const addFacilityToFirestore = async (facility: Facility) => {
  await setDoc(doc(firestore, `facilities/${facility.id}`), facility)
}

export const deleteFacilityFromFirestore = async (facilityId: string) => {
  await deleteDoc(doc(firestore, `facilities/${facilityId}`))
}

export const assignTaskToFacilityInFirestore = async (
  facilityId: string,
  taskId: string,
) => {
  await updateDoc(doc(firestore, `facilities/${facilityId}`), {
    tasks: arrayUnion(taskId),
  })
}

export const updateFacilityInFirestore = async (
  id: string,
  updateData: { [key: string]: any },
) => {
  await updateDoc(doc(firestore, `facilities/${id}`), updateData)
}

export const removeTaskFromFacilityInFirestore = async (
  facilityId: string,
  taskId: string,
) => {
  await updateDoc(doc(firestore, `facilities/${facilityId}`), {
    tasks: arrayRemove(taskId),
  })
}

const fetchFacilities = async () => {
  const tasks: { [id: string]: Facility } = {}
  const querySnapshot = await getDocs(collection(firestore, "facilities"))
  querySnapshot.forEach((doc) => {
    tasks[doc.id] = doc.data() as Facility
  })
  return tasks
}

export function* fetchFacilitiesSaga() {
  try {
    const facilities: { [key: string]: Facility } = yield call(fetchFacilities)
    yield put(setFacilities(facilities))
  } catch (error) {
    yield put(
      setToastOpen({
        message: "Error fetching facilities",
        severity: "error",
      }),
    )
  }
}

export function* updateFacilitySaga(
  action: PayloadAction<{ id: string; data: any }>,
): Generator<any, void, any> {
  try {
    const { id, data } = action.payload
    yield call(updateFacilityInFirestore, id, data)
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
    yield call(addFacilityToFirestore, action.payload)
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
    const facilityId = action.payload.id
    const tasks = action.payload.tasks
    yield put(removeFacilityFromGrid({ facilityId }))
    yield call(undropMultipleTasksInFirestore, tasks)
    yield call(deleteFacilityFromFirestore, facilityId)
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
  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, "facilities")
    const unsubscribe = onSnapshot(colRef, async () => {
      const snapshot = await getDocs(collection(firestore, "facilities"))
      const facilities: { [key: string]: Facility } = {}
      snapshot.forEach((doc) =>
        Object.assign(facilities, { [doc.id]: doc.data() as Facility }),
      )
      emitter(facilities)
    })

    return unsubscribe
  })

  try {
    while (true) {
      const facilities: { [key: string]: Facility } = yield take(channel)
      const prevFacilities: { [key: string]: Facility } = yield select(
        (state) => state.facilities.facilities,
      )
      if (hashObject(facilities) !== hashObject(prevFacilities)) {
        console.log("Facilities updated")
        yield put(setFacilities(facilities))
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

function* watchUpdateFacility() {
  yield takeLatest(updateFacilityStart.type, updateFacilitySaga)
}

function* watchFetchFacility() {
  yield takeLatest(syncFacilitiesStart.type, fetchFacilitiesSaga)
}

function* watchSyncFacilities() {
  yield takeLatest(syncFacilitiesStart.type, syncFacilitiesSaga)
}

export default function* facilitiesSagas() {
  yield all([
    watchAddFacility(),
    watchDeleteFacility(),
    watchSyncFacilities(),
    watchFetchFacility(),
    watchUpdateFacility(),
  ])
}
