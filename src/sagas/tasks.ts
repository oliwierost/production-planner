import { eventChannel } from "redux-saga";
import { PayloadAction } from "@reduxjs/toolkit";
import { call, put } from "redux-saga/effects";
import { firestore } from "../../firebase.config";
import { removeTaskFromFacility } from "../slices/facilities";
import { setTaskDropped } from "../slices/tasks";

export function* deleteTaskSaga(
  action: PayloadAction<{ taskId: number; facilityId: number }>
) {
  try {
    const { taskId, facilityId } = action.payload;
    // Delete the task from Firestore
    yield call([firestore.collection("tasks").doc(taskId), "delete"]);
    // Dispatch an action to remove the task from its facility
    yield put(removeTaskFromFacility({ facilityId, taskId }));
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

export function* syncTasksSaga() {
  const channel = eventChannel((emitter) => {
    const unsubscribe = firestore.collection("tasks").onSnapshot((snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => tasks.push({ id: doc.id, ...doc.data() }));
      emitter(tasks);
    });
    return unsubscribe;
  });

  try {
    while (true) {
      const tasks = yield take(channel);
      yield put(setTasks(tasks)); // Assuming you have a 'setTasks' action
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}
