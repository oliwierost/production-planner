import { createSelector } from "reselect"
import { RootState } from "../store"

export const selectTimestampsFromMapping = createSelector(
  [
    (state: RootState) => state.view,
    (_: RootState, timestamp: number) => ({
      timestamp,
    }),
  ],
  (view, { timestamp }) => {
    const viewName = view.view?.name
    if (!view || !timestamp || !viewName) return null
    const weekMapping = view.weekMapping
    const monthMapping = view.monthMapping

    if (viewName === "1 mies.") {
      return [timestamp]
    } else if (viewName === "3 mies.") {
      return weekMapping[timestamp]
    } else if (viewName === "1 rok") {
      return monthMapping[timestamp]
    } else {
      return null
    }
  },
)
