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
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { firestore } from "../../firebase.config"
import { updateGridStart, setGrid } from "../slices/grid"
import { eventChannel } from "redux-saga"
import { setToastOpen } from "../slices/toast"
import { User } from "../slices/user"
import { workspaceId } from "../slices/workspaces"

export const fetchGridFromFirestore = async (
  userId: string,
  selectedWorkspaceId: string,
): Promise<GridType | null> => {
  const snapshot = await getDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${selectedWorkspaceId}/grid/first-grid`,
    ),
  )
  return snapshot.exists() ? (snapshot.data() as GridType) : null
}

export const updateGridInFirestore = async (
  userId: string,
  gridData: GridType,
  selectedWorkspaceId: string,
): Promise<void> => {
  const gridRef = doc(
    firestore,
    `users/${userId}/workspaces/${selectedWorkspaceId}/grid/first-grid`,
  )
  const gridSnapshot = await getDoc(gridRef)
  !gridSnapshot.exists()
    ? await setDoc(gridRef, gridData)
    : await updateDoc(gridRef, { ...gridData })
}

function* updateGridSaga(action: PayloadAction<GridType>) {
  try {
    const userId: string = yield select((state) => state.user.user?.id)
    const selectedWorkspaceId: string = yield select(
      (state) => state.workspaces.selectedWorkspace,
    )
    yield call(
      updateGridInFirestore,
      userId,
      action.payload,
      selectedWorkspaceId,
    )
  } catch (error) {
    yield put(
      setToastOpen({ message: "Grid update failed", severity: "error" }),
    )
  }
}

function* initializeGridSaga() {
  try {
    const user: User = yield select((state) => state.user.user)
    const userId = user?.id
    const workspaceId = user?.openWorkspaceId
    if (!userId || !workspaceId) return
    const gridData: GridType | null = yield call(
      fetchGridFromFirestore,
      userId,
      workspaceId,
    )

    if (!gridData) {
      yield put(initializeGrid({ workspaceId: workspaceId }))
      yield call(
        updateGridInFirestore,
        userId,
        {
          cells: {},
        },
        workspaceId,
      )
    }
  } catch (error) {
    console.error("Error initializing grid data:", error)
  }
}

export function* syncGridSaga() {
  const user: User = yield select((state) => state.user.user)
  const userId = user?.id
  if (!userId) return

  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, `users/${userId}/workspaces`)
    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      snapshot.forEach((workspaceDoc) => {
        const workspaceId = workspaceDoc.id
        const gridRef = collection(
          firestore,
          `users/${userId}/workspaces/${workspaceId}/grid`,
        )
        onSnapshot(gridRef, async (gridSnapshot) => {
          const grid = {} as { [id: workspaceId]: GridType }
          gridSnapshot.forEach((doc) => {
            grid[workspaceId] = doc.data() as GridType
          })
          emitter(grid)
        })
      })
    })

    return unsubscribe
  })

  try {
    while (true) {
      const gridData: { [id: workspaceId]: GridType } = yield take(channel)
      yield put(setGrid({ grid: gridData }))
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
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
  yield all([watchUpdateGrid(), watchInitializeGrid(), watchSyncGrid()])
}
