import { all, call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { GridType } from "../slices/grid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../firebase.config";
import { fetchGridStart, updateGridStart, setGrid } from "../slices/grid";

export const fetchGridFromFirestore = async (): Promise<GridType | null> => {
  const snapshot = await getDoc(doc(firestore, "grid", "first-grid"));
  return snapshot.exists() ? (snapshot.data() as GridType) : null;
};

export const updateGridInFirestore = async (
  gridData: GridType
): Promise<void> => {
  await setDoc(doc(firestore, "grid", "first-grid"), gridData);
};

function* fetchGridSaga() {
  try {
    const gridData: GridType | null = yield call(fetchGridFromFirestore);
    if (gridData) {
      yield put(setGrid(gridData)); // Assuming you have a 'setGrid' action in your grid slice
    } else {
      console.error("No grid data found");
    }
  } catch (error) {
    console.error("Error fetching grid data:", error);
  }
}

function* updateGridSaga(action: PayloadAction<GridType>) {
  try {
    yield call(updateGridInFirestore, action.payload);
    // Dispatch success action or handle success scenario
  } catch (error) {
    console.error("Error updating grid data:", error);
    // Dispatch failure action or handle error scenario
  }
}

function* watchFetchGrid() {
  yield takeLatest(fetchGridStart.type, fetchGridSaga);
}

function* watchUpdateGrid() {
  yield takeLatest(updateGridStart.type, updateGridSaga);
}

export default function* gridSagas() {
  yield all([watchFetchGrid(), watchUpdateGrid()]);
}
