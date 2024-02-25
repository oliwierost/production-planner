import { all, call, cancelled, put, take, takeLatest } from "redux-saga/effects"
import { PayloadAction } from "@reduxjs/toolkit"
import {
  initializeGrid,
  initializeGridStart,
  syncGridStart,
} from "../slices/grid"
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore"
import { firestore } from "../../firebase.config"
import { fetchGridStart, updateGridStart, setGrid } from "../slices/grid"
import { eventChannel } from "redux-saga"
import { setToastOpen } from "../slices/toast"
import type { Grid } from "../../types"

export const fetchGridFromFirestore = async (): Promise<Grid | null> => {
  const snapshot = await getDoc(doc(firestore, "grid", "first-grid"))
  return snapshot.exists() ? (snapshot.data() as Grid) : null
}

export const updateGridInFirestore = async (gridData: Grid): Promise<void> => {
  const gridRef = doc(firestore, "grid", "first-grid")
  const gridSnapshot = await getDoc(gridRef)
  !gridSnapshot.exists()
    ? await setDoc(gridRef, gridData)
    : await updateDoc(gridRef, { ...gridData })
}

function* fetchGridSaga() {
  try {
    const gridData: Grid | null = yield call(fetchGridFromFirestore)
    if (gridData) {
      yield put(setGrid(gridData))
    } else {
      console.error("No grid data found")
    }
  } catch (error) {
    console.error("Error fetching grid data:", error)
  }
}

function* updateGridSaga(action: PayloadAction<Grid>) {
  try {
    yield call(updateGridInFirestore, action.payload)
  } catch (error) {
    yield put(
      setToastOpen({ message: "Grid update failed", severity: "error" }),
    )
  }
}

function* initializeGridSaga() {
  try {
    const gridData: Grid | null = yield call(fetchGridFromFirestore)
    // initialize empty grid if it doesn't exist
    if (!gridData) {
      yield put(initializeGrid())
      yield call(updateGridInFirestore, {
        cells: {},
      })
    }
  } catch (error) {
    console.error("Error initializing grid data:", error)
  }
}

export function* syncGridSaga() {
  const channel = eventChannel((emitter) => {
    const docRef = doc(firestore, "grid", "first-grid")
    const unsubscribe = onSnapshot(docRef, async () => {
      const snapshot = await getDoc(docRef)
      const gridData: Grid | null = snapshot.exists()
        ? (snapshot.data() as Grid)
        : null
      if (gridData) {
        emitter(gridData)
      }
    })

    return unsubscribe
  })

  try {
    while (true) {
      const gridData: Grid = yield take(channel)
      yield put(setGrid(gridData))
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

function* watchFetchGrid() {
  yield takeLatest(fetchGridStart.type, fetchGridSaga)
}

function* watchUpdateGrid() {
  yield takeLatest(updateGridStart.type, updateGridSaga)
}

function* watchInitializeGrid() {
  yield takeLatest(initializeGridStart.type, initializeGridSaga)
}

function* watchSyncGrid() {
  yield takeLatest(syncGridStart.type, syncGridSaga)
}

export default function* gridSagas() {
  yield all([
    watchFetchGrid(),
    watchUpdateGrid(),
    watchInitializeGrid(),
    watchSyncGrid(),
  ])
}
