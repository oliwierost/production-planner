import { useEffect, useState } from "react"
import { DataGridPro, useGridApiRef } from "@mui/x-data-grid-pro"
import { Cell } from "../Cell/Cell"
import { useAppSelector } from "../../hooks"
import { selectFacilities } from "../../selectors/facilities"

export function DataGrid() {
  const [, setCellWidth] = useState<number>(100)
  const apiRef = useGridApiRef()
  const user = useAppSelector((state) => state.user.user)
  const facilities = useAppSelector((state) =>
    selectFacilities(state, user?.openWorkspaceId),
  )
  const viewState = useAppSelector((state) => state.view)
  const view = viewState.view

  const handleZoom = (event: WheelEvent) => {
    // Check if the "Ctrl" key is pressed
    if (event.metaKey) {
      event.preventDefault()
      const minCellWidth = 50
      const maxCellWidth = 200
      // Zoom in
      if (event.deltaY < 0) {
        setCellWidth((cellWidth) =>
          cellWidth >= maxCellWidth ? cellWidth : cellWidth + 2,
        )
      }
      // Zoom out
      if (event.deltaY > 0) {
        setCellWidth((cellWidth) =>
          cellWidth <= minCellWidth ? cellWidth : cellWidth - 2,
        )
      }
    }
  }

  useEffect(() => {
    // Add event listener to the component when it mounts
    document.addEventListener("wheel", handleZoom, { passive: false })

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("wheel", handleZoom)
    }
  }, []) //

  return (
    <DataGridPro
      apiRef={apiRef}
      rows={Object.values(facilities || {})}
      columns={view?.headerBottomData || []}
      disableColumnFilter
      disableColumnMenu
      disableRowSelectionOnClick
      disableColumnSelector
      disableDensitySelector
      disableMultipleRowSelection
      hideFooter
      rowHeight={50}
      columnBuffer={30}
      pinnedColumns={{
        left: ["stand"],
      }}
      pinnedRows={{
        top: [
          {
            id: "0",
            manpower: 0,
            title: "",
            description: "",
            bgcolor: "",
            tasks: [],
            index: 0,
            workspaceId: "",
            attributes: {},
            conditions: {},
          },
        ],
      }}
      slots={{
        cell: Cell,
      }}
      slotProps={{
        cell: {
          view: view,
        },
      }}
      sx={{
        //disable cell outline on focus
        "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
          width: "100%",
        },
        "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
          backgroundColor: "#D9D9D9", // track color
        },
        "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
          backgroundColor: "#5A5A5A",
        },

        "& .MuiDataGrid-cell": {
          all: "unset",

          "&:focus": {
            all: "unset",
            outline: "none",
          },
          //target pinned column cells
          "&.MuiDataGrid-pinned": {
            boxShadow: "none",
          },
        },
        //target MuiDataGrid-pinnedColumns
        "& .MuiDataGrid-pinnedColumns": {
          boxShadow: "none",
        },
        //disable header cell outline on focus
        "& .MuiDataGrid-columnHeaders": {
          all: "unset",
          display: "none",
          "&:focus": {
            all: "unset",
            outline: "none",
          },
        },
      }}
    />
  )
}
