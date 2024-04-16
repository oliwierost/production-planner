import { configureStore } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"
import { all } from "redux-saga/effects"

import deadlinesReducer from "../slices/deadlines" // Adjust the import path as necessary
import dragReducer from "../slices/drag" // Adjust the import path as necessary
import facilitiesReducer from "../slices/facilities" // Adjust the import path as necessary
import gridReducer from "../slices/grid" // Adjust the import path as necessary
import invitesReducer from "../slices/invites" // Adjust the import path as necessary
import projectsReducer from "../slices/projects" // Adjust the import path as necessary
import tasksReducer from "../slices/tasks" // Adjust the import path as necessary
import toastReducer from "../slices/toast" // Adjust the import path as necessary
import userReducer from "../slices/user" // Adjust the import path as necessary
import viewReducer from "../slices/view" // Adjust the import path as necessary
import workspacesReducer from "../slices/workspaces" // Adjust the import path as necessary
import raportsReducer from "../slices/raports" // Adjust the import path as necessary

import deadlineSagas from "../sagas/deadlines"
import facilitiesSagas from "../sagas/facilities"
import gridSagas from "../sagas/grid"
import inviteSagas from "../sagas/invites"
import projectsSagas from "../sagas/projects"
import tasksSagas from "../sagas/tasks"
import userSagas from "../sagas/user"
import workspacesSagas from "../sagas/workspaces"
import raportsSagas from "../sagas/raports"

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    grid: gridReducer,
    tasks: tasksReducer,
    facilities: facilitiesReducer,
    view: viewReducer,
    toast: toastReducer,
    drag: dragReducer,
    deadlines: deadlinesReducer,
    workspaces: workspacesReducer,
    projects: projectsReducer,
    user: userReducer,
    invites: invitesReducer,
    raports: raportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
      sagaMiddleware,
    ),
})

function* rootSaga() {
  yield all([
    gridSagas(),
    tasksSagas(),
    facilitiesSagas(),
    deadlineSagas(),
    workspacesSagas(),
    projectsSagas(),
    userSagas(),
    inviteSagas(),
    raportsSagas(),
  ])
}

sagaMiddleware.run(rootSaga)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
