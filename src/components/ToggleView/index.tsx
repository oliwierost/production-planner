import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import {
  generateQuarterYearView,
  generateMonthView,
  generateYearView,
} from "../../generateView"

import { useAppDispatch, useAppSelector } from "../../hooks"
import { setMonthView, setQuarterView, setYearView } from "../../slices/view"
import ViewWeekIcon from "@mui/icons-material/ViewWeek"
import ViewDayIcon from "@mui/icons-material/ViewDay"
import { ViewTimeline } from "@mui/icons-material"
import { Tooltip } from "@mui/material"
import { setDragDisabled } from "../../slices/drag"

export function ToggleView() {
  const dispatch = useAppDispatch()
  const gridState = useAppSelector((state) => state.grid)
  const viewState = useAppSelector((state) => state.view)
  const cellStateMap = gridState.grid
  const view = viewState.view
  if (!view) return null

  const handleChange = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    newView: string,
  ) => {
    if (cellStateMap) {
      switch (newView) {
        case "year":
          dispatch(
            setYearView({
              view: generateYearView(1000),
              grid: cellStateMap,
            }),
          )
          dispatch(setDragDisabled(true))
          break
        case "3months.":
          dispatch(
            setQuarterView({
              view: generateQuarterYearView(1000),
              grid: cellStateMap,
            }),
          )
          dispatch(setDragDisabled(true))
          break
        case "1month.":
          dispatch(
            setMonthView({ view: generateMonthView(1000), grid: cellStateMap }),
          )
          dispatch(setDragDisabled(false))
          break
      }
    }
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography
        color={view?.name == "1 mies." ? "#228B22" : "#FF5349"}
        fontWeight={600}
        variant="body2"
      >
        Tryb {view?.name == "1 mies." ? "edycji" : "odczytu"}
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={view?.name}
        exclusive
        onChange={handleChange}
        sx={{
          all: "unset",
        }}
      >
        <Tooltip title="1 rok" arrow>
          <ToggleButton
            value="year"
            sx={{
              px: 1,
              py: 0.5,
              border: "none",
              "&:focus": {
                outline: "none",
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            <ViewTimeline />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="3 miesiące" arrow>
          <ToggleButton
            value="3months."
            sx={{
              px: 1,
              py: 0.5,
              border: "none",
              "&:focus": {
                outline: "none",
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            <ViewWeekIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="1 miesiąc" arrow>
          <ToggleButton
            value="1month."
            sx={{
              px: 1,
              py: 0.5,
              border: "none",
              "&:focus": {
                outline: "none",
                bgcolor: "primary.main",
                color: "white",
              },
            }}
          >
            <ViewDayIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Stack>
  )
}
