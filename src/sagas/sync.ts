import { takeEvery, put } from "redux-saga/effects"
import { syncTasksStart } from "../slices/tasks"
import { syncFacilitiesStart } from "../slices/facilities"
import { syncGridStart, initializeGridStart } from "../slices/grid"
import { syncDeadlinesStart } from "../slices/deadlines"
import { syncDataStart } from "../slices/sync"

function* handleBatchedActions() {
  yield put(syncTasksStart())
  yield put(syncFacilitiesStart())
  yield put(syncGridStart())
  yield put(syncDeadlinesStart())
  yield put(initializeGridStart())
}

export function* watchBatchedActions() {
  yield takeEvery(syncDataStart().type, handleBatchedActions)
}

export default function* syncSaga() {
  yield watchBatchedActions()
}
