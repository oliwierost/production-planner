import {
  all,
  call,
  cancelled,
  put,
  select,
  take,
  takeLatest,
} from "redux-saga/effects"
import { PayloadAction } from "@reduxjs/toolkit"
import {
  GridType,
  initializeGrid,
  initializeGridStart,
  syncGridStart,
} from "../slices/grid"
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore"
import { firestore } from "../../firebase.config"
import { fetchGridStart, updateGridStart, setGrid } from "../slices/grid"
import { eventChannel } from "redux-saga"
import { setToastOpen } from "../slices/toast"
import { hashObject } from "./facilities"

export const fetchGridFromFirestore = async (
  selectedWorkspaceId: string,
): Promise<GridType | null> => {
  const snapshot = await getDoc(
    doc(
      firestore,
      `users/first-user/workspaces/${selectedWorkspaceId}/grid/first-grid`,
    ),
  )
  return snapshot.exists() ? (snapshot.data() as GridType) : null
}

export const updateGridInFirestore = async (
  gridData: GridType,
  selectedWorkspaceId: string,
): Promise<void> => {
  const gridRef = doc(
    firestore,
    `users/first-user/workspaces/${selectedWorkspaceId}/grid/first-grid`,
  )
  const gridSnapshot = await getDoc(gridRef)
  !gridSnapshot.exists()
    ? await setDoc(gridRef, gridData)
    : await updateDoc(gridRef, { ...gridData })
}

function* fetchGridSaga() {
  try {
    const selectedWorkspaceId: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    const gridData: GridType | null = yield call(
      fetchGridFromFirestore,
      selectedWorkspaceId,
    )
    if (gridData) {
      yield put(setGrid(gridData))
    } else {
      console.error("No grid data found")
    }
  } catch (error) {
    console.error("Error fetching grid data:", error)
  }
}

function* updateGridSaga(action: PayloadAction<GridType>) {
  try {
    const selectedWorkspaceId: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    yield call(updateGridInFirestore, action.payload, selectedWorkspaceId)
  } catch (error) {
    yield put(
      setToastOpen({ message: "Grid update failed", severity: "error" }),
    )
  }
}

function* initializeGridSaga() {
  try {
    const selectedWorkspaceId: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    const gridData: GridType | null = yield call(
      fetchGridFromFirestore,
      selectedWorkspaceId,
    )
    if (!gridData) {
      yield put(initializeGrid())
      yield call(
        updateGridInFirestore,
        {
          cells: {},
        },
        selectedWorkspaceId,
      )
    }
  } catch (error) {
    console.error("Error initializing grid data:", error)
  }
}

export function* syncGridSaga() {
  const selectedWorkspaceId: string = yield select(
    (state) => state.workspaces.selectedWorkspace,
  )

  const channel = eventChannel((emitter) => {
    const docRef = doc(
      firestore,
      `users/first-user/workspaces/${selectedWorkspaceId}/grid/first-grid`,
    )
    const unsubscribe = onSnapshot(docRef, async () => {
      const snapshot = await getDoc(docRef)
      const gridData: GridType | null = snapshot.exists()
        ? (snapshot.data() as GridType)
        : null
      if (gridData) {
        emitter(gridData)
      }
    })

    return unsubscribe
  })

  try {
    while (true) {
      const gridData: GridType = yield take(channel)
      const prevGridData: GridType = yield select((state) => state.grid.grid)
      if (hashObject(gridData) !== hashObject(prevGridData)) {
        yield put(setGrid(gridData))
      }
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
