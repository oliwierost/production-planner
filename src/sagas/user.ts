import { PayloadAction } from "@reduxjs/toolkit"
import {
  all,
  call,
  cancelled,
  put,
  select,
  take,
  takeLatest,
} from "redux-saga/effects"

import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore"
import { auth, firestore } from "../../firebase.config"

import { eventChannel } from "redux-saga"

import {
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { projectId } from "../slices/projects"
import { setToastOpen } from "../slices/toast"
import {
  Credentials,
  User,
  initializeUserStart,
  setOpenStart,
  setProjectOpen,
  setUser,
  setUserOpen,
  setWorkspaceOpen,
  signInStart,
  signOutStart,
  syncUserStart,
  userId,
} from "../slices/user"
import { workspaceId } from "../slices/workspaces"
import { hashObject } from "./facilities"

export const fetchUserFromFirestore = async (userId: string): Promise<User> => {
  const docRef = doc(firestore, `users/${userId}`)
  const snapshot = await getDoc(docRef)
  return snapshot.data() as User
}

export const addUserInFirestore = async (user: User): Promise<void> => {
  const userRef = doc(firestore, `users/${user.id}`)
  await setDoc(userRef, user)
}

export const updateUserInFirestore = async ({
  userId,
  data,
}: {
  userId: string
  data: Partial<User>
}): Promise<void> => {
  const userRef = doc(firestore, `users/${userId}`)
  await updateDoc(userRef, data)
}

export const signUpWithFirebase = async (
  credentials: Credentials,
): Promise<UserCredential | undefined> => {
  try {
    const { email, password } = credentials
    const user = await createUserWithEmailAndPassword(auth, email, password)
    return user
  } catch (error) {
    console.error("Error signing up with Firebase:", error)
  }
}

export const signInUserWithFirebase = async (
  credentials: Credentials,
): Promise<UserCredential | null> => {
  const { email, password } = credentials
  const user = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export const signOutUserWithFirebase = async (): Promise<void> => {
  await auth.signOut()
}

function* initializeUserSaga(action: PayloadAction<Credentials>) {
  try {
    const credentials = action.payload
    const userCredential: UserCredential = yield call(
      signUpWithFirebase,
      credentials,
    )
    const user = {
      id: userCredential.user.uid,
      email: userCredential.user.email!,
      openUserId: null,
      openProjectId: null,
      openWorkspaceId: null,
      openProjectPermissions: null,
    }
    yield call(addUserInFirestore, user)
    yield put(setUser(user))
    yield put(
      setToastOpen({ message: "Signed up successfully!", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Error signing up!", severity: "error" }))
  }
}

function* signInSaga(action: PayloadAction<Credentials>) {
  try {
    const userCredential: UserCredential = yield call(
      signInUserWithFirebase,
      action.payload,
    )
    const user: User = yield call(
      fetchUserFromFirestore,
      userCredential?.user.uid,
    )
    yield put(setUser(user))
    yield put(
      setToastOpen({ message: "Signed in successfully!", severity: "success" }),
    )
  } catch (error) {
    yield put(setToastOpen({ message: "Error signing in!", severity: "error" }))
  }
}

function* signOutSaga() {
  try {
    yield call(signOutUserWithFirebase)
    yield put(setUser(null))
    yield put(
      setToastOpen({
        message: "Signed out successfully!",
        severity: "success",
      }),
    )
  } catch (error) {
    yield put(
      setToastOpen({
        message: "Error signing out!",
        severity: "success",
      }),
    )
  }
}

function* setOpenSaga(
  action: PayloadAction<{
    projectId: projectId
    workspaceId: workspaceId
    userId: userId
  }>,
) {
  try {
    const { projectId, workspaceId, userId } = action.payload
    const currentUserId: userId = yield select((state) => state.user.user.id)
    yield put(setProjectOpen(projectId))
    yield put(setWorkspaceOpen(workspaceId))
    yield put(setUserOpen(userId))
    yield call(updateUserInFirestore, {
      userId: currentUserId,
      data: {
        openProjectId: projectId,
        openWorkspaceId: workspaceId,
        openUserId: userId,
      },
    })
  } catch (error) {
    yield put(
      setToastOpen({
        message: "Error setting project open!",
        severity: "error",
      }),
    )
  }
}

export function* syncUserSaga({
  payload: userId,
}: PayloadAction<string | undefined>) {
  if (!userId) {
    return
  }
  const channel = eventChannel((emitter) => {
    const docRef = doc(firestore, `users/${userId}`)
    const unsubscribe = onSnapshot(docRef, async () => {
      const snapshot = await getDoc(docRef)
      const userData: User | null = snapshot.exists()
        ? (snapshot.data() as User)
        : null
      if (userData) {
        emitter(userData)
      }
    })

    return unsubscribe
  })

  try {
    while (true) {
      const userData: User = yield take(channel)
      const prevUserData: User = yield select((state) => state.user.user)
      if (hashObject(userData) !== hashObject(prevUserData)) {
        yield put(setUser(userData))
      }
    }
  } finally {
    const isCancelled: boolean = yield cancelled()
    if (isCancelled) {
      channel.close()
    }
  }
}

function* watchSetOpenSaga() {
  yield takeLatest(setOpenStart.type, setOpenSaga)
}

function* watchInitializeUser() {
  yield takeLatest(initializeUserStart.type, initializeUserSaga)
}

function* watchSignOut() {
  yield takeLatest(signOutStart.type, signOutSaga)
}

function* watchSetUser() {
  yield takeLatest(signInStart.type, signInSaga)
}

function* watchSyncUser() {
  yield takeLatest(syncUserStart.type, syncUserSaga)
}

export default function* userSagas() {
  yield all([
    watchSetOpenSaga(),
    watchInitializeUser(),
    watchSignOut(),
    watchSetUser(),
    watchSyncUser(),
  ])
}
