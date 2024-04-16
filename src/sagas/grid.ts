import { PayloadAction } from "@reduxjs/toolkit"
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
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
  Grid,
  GridType,
  initializeGrid,
  initializeGridStart,
  setGrid,
  syncCollabGridStart,
  syncGridStart,
  updateGridStart,
} from "../slices/grid"
import { Invite, inviteId } from "../slices/invites"
import { setToastOpen } from "../slices/toast"
import { User, userId } from "../slices/user"
import { workspaceId } from "../slices/workspaces"

export const fetchGridFromFirestore = async (
  userId: userId,
  selectedWorkspaceId: workspaceId,
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
  userId: userId,
  gridData: GridType,
  selectedWorkspaceId: workspaceId,
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
    const userId: string = yield select((state) => state.user.user?.openUserId)
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
    const userId = user?.openUserId
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
          const grid = {} as Grid
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

export function* syncCollabGridSaga() {
  const userId: string = yield select((state) => state.user.user?.openUserId)
  const invites: { [key: inviteId]: Invite } = yield select(
    (state) => state.invites.invites,
  )

  if (!userId || Object.keys(invites).length === 0) return

  const channels: EventChannel<Grid>[] = Object.values(invites).map(
    (invite) => {
      return eventChannel((emitter) => {
        const docRef = doc(
          firestore,
          `users/${invite.invitingUserId}/workspaces/${invite.workspaceId}/grid/first-grid`,
        )
        const unsubscribe = onSnapshot(docRef, async () => {
          const snapshot = await getDoc(docRef)
          const grid = {
            [invite.workspaceId]: snapshot.data() as GridType,
          } as Grid
          emitter(grid)
        })
        return unsubscribe
      })
    },
  )

  try {
    while (true) {
      const results: Grid[] = yield race(
        channels.map((channel) => take(channel)),
      )
      for (const result of results) {
        if (result) {
          const collabGrid: Grid = result
          yield put(setGrid(collabGrid))
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

function* watchUpdateGrid() {
  yield takeLatest(updateGridStart.type, updateGridSaga)
}

function* watchInitializeGrid() {
  yield takeLatest(initializeGridStart.type, initializeGridSaga)
}

function* watchSyncGrid() {
  yield takeLatest(syncGridStart.type, syncGridSaga)
}

function* watchSyncCollabGrid() {
  yield takeLatest(syncCollabGridStart.type, syncCollabGridSaga)
}

export default function* gridSagas() {
  yield all([
    watchUpdateGrid(),
    watchInitializeGrid(),
    watchSyncGrid(),
    watchSyncCollabGrid(),
  ])
}
