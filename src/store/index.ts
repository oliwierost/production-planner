import createSagaMiddleware from "redux-saga";
import { configureStore } from "@reduxjs/toolkit";
import { all } from "redux-saga/effects";

import gridReducer from "../slices/grid"; // Adjust the import path as necessary
import tasksReducer from "../slices/tasks"; // Adjust the import path as necessary
import facilitiesReducer from "../slices/facilities"; // Adjust the import path as necessary

import gridSagas from "../sagas/grid";
// import { watchTasksSagas } from "../sagas/tasks";
// import { watchFacilitiesSagas } from "../sagas/facilities";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    grid: gridReducer,
    tasks: tasksReducer,
    facilities: facilitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

function* rootSaga() {
  yield all([gridSagas()]); // watchTasksSagas(), watchFacilitiesSagas()]);
}

sagaMiddleware.run(rootSaga);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
