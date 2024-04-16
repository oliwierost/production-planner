import { PayloadAction } from "@reduxjs/toolkit"
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore"
import { FormikHelpers } from "formik"
import React from "react"
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
import { Modal } from "../components/DataPanel"
import { RaportFormData } from "../components/RaportModal"
import { selectProject } from "../selectors/projects"
import { Invite } from "../slices/invites"
import {
  Raport,
  raportId,
  setCollabRaports,
  setRaports,
  syncCollabRaportsStart,
  syncRaportsStart,
  upsertRaport,
  upsertRaportStart,
} from "../slices/raports"
import { taskId, updateTask } from "../slices/tasks"
import { setToastOpen } from "../slices/toast"
import { userId } from "../slices/user"
import { workspaceId } from "../slices/workspaces"
import { selectTask } from "../selectors/tasks"
import { updateTaskInFirestore } from "./tasks"

const addRaportToFirestore = async (
  userId: userId,
  workspaceId: workspaceId,
  raport: Raport,
) => {
  await setDoc(
    doc(
      firestore,
      `users/${userId}/workspaces/${workspaceId}/raports/${raport.id}`,
    ),
    raport,
  )
}

export function* upsertRaportSaga(
  action: PayloadAction<{
    raport: Raport
    resetForm: FormikHelpers<RaportFormData>["resetForm"]
    setModal: React.Dispatch<React.SetStateAction<Modal | null>>
  }>,
): Generator<any, void, any> {
  const { raport, resetForm } = action.payload
  const { workspaceId, taskId, projectId } = raport
  const project = yield select((state) =>
    selectProject(state, workspaceId, projectId),
  )
  const userId = project.ownerId
  const task = yield select((state) => selectTask(state, taskId, projectId))
  const createdAt: number = Date.now()
  try {
    yield put(
      upsertRaport({
        raport: { ...raport, prevProgress: task.progress, createdAt },
        taskId,
      }),
    )
    yield put(updateTask({ task, data: { progress: raport.progress } }))
    yield call(addRaportToFirestore, userId, workspaceId, {
      ...raport,
      prevProgress: task.progress,
      createdAt,
    })
    yield call(
      updateTaskInFirestore,
      userId,
      taskId,
      {
        progress: raport.progress,
      },
      workspaceId,
    )
    yield put(setToastOpen({ message: "Złożono raport", severity: "success" }))
    resetForm()
  } catch (error) {
    yield put(setToastOpen({ message: "Wystąpił błąd", severity: "error" }))
  }
}

export function* syncRaportsSaga() {
  const userId: userId = yield select((state) => state.user.user?.id)
  const prevRaports: { [id: taskId]: { [id: raportId]: Raport } } =
    yield select((state) => state.raports.raports)
  if (!userId) return

  const channel = eventChannel((emitter) => {
    const colRef = collection(firestore, `users/${userId}/workspaces`)

    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      snapshot.forEach((workspaceDoc) => {
        const workspaceId = workspaceDoc.id
        const raportsRef = collection(
          firestore,
          `users/${userId}/workspaces/${workspaceId}/raports`,
        )
        onSnapshot(raportsRef, async (raportsSnapshot) => {
          const newRaports = { ...prevRaports }
          raportsSnapshot.forEach((doc) => {
            const docData = doc.data()
            newRaports[docData.taskId][docData.id] = {
              id: doc.id,
              ...docData,
            } as Raport
          })
          emitter({ ...prevRaports, ...newRaports })
        })
      })
    })

    return unsubscribe
  })

  try {
    while (true) {
      const raports: { [id: taskId]: { [id: raportId]: Raport } } = yield take(
        channel,
      )
      yield put(setRaports(raports))
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

export function* syncCollabRaportsSaga() {
  const userId: string = yield select((state) => state.user.user?.id)
  const invites: { [key: string]: Invite } = yield select(
    (state) => state.invites.invites,
  )

  if (!userId || Object.keys(invites).length === 0) return

  const channels: EventChannel<Raport[]>[] = Object.values(invites).map(
    (invite) => {
      return eventChannel((emitter) => {
        const colRef = collection(
          firestore,
          `users/${invite.invitingUserId}/workspaces/${invite.workspaceId}/raports`,
        )
        const unsubscribe = onSnapshot(colRef, async () => {
          const snapshot = await getDocs(colRef)
          const raports = snapshot.docs.map((doc) => ({
            id: doc.id,
            inviteId: invite.id,
            ...doc.data(),
          })) as Raport[]
          emitter(raports)
        })
        return unsubscribe
      })
    },
  )

  try {
    while (true) {
      const results: Raport[][] = yield race(
        channels.map((channel) => take(channel)),
      )
      for (const result of results) {
        if (result) {
          const tasks: Raport[] = result
          yield put(setCollabRaports(tasks))
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

function* waatchUpsertRaport() {
  yield takeLatest(upsertRaportStart.type, upsertRaportSaga)
}

function* watchSyncRaports() {
  yield takeLatest(syncRaportsStart.type, syncRaportsStart)
}

function* watchSyncCollabRaports() {
  yield takeLatest(syncCollabRaportsStart.type, syncCollabRaportsSaga)
}

export default function* raportsSagas() {
  yield all([
    waatchUpsertRaport(),
    watchSyncRaports(),
    watchSyncCollabRaports(),
  ])
}
