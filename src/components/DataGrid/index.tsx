import { useEffect, useState } from "react"
import { DataGridPro, useGridApiRef } from "@mui/x-data-grid-pro"
import { Cell } from "../Cell/Cell"
import { useAppSelector } from "../../hooks"
import { Facility } from "../../slices/facilities"

export function DataGrid() {
  const [, setCellWidth] = useState<number>(100)
  const [sortedFacilities, setSortedFacilities] = useState<Facility[]>([])
  const apiRef = useGridApiRef()
  const draggedTask = useAppSelector((state) => state.drag.draggedTask)
  const facilitiesState = useAppSelector((state) => state.facilities)
  const viewState = useAppSelector((state) => state.view)
  const facilities = facilitiesState.facilities
  const view = viewState.view

  useEffect(() => {
    const sortedFacilities = Object.values(facilities).sort((a, b) => {
      if (a.bgcolor < b.bgcolor) {
        return -1
      }
      if (a.bgcolor > b.bgcolor) {
        return 1
      }
      return 0
    })
    setSortedFacilities(sortedFacilities)
  }, [facilities])

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
      rows={sortedFacilities}
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
      pinnedRows={{
        top: [
          {
            id: "0",
            activity: "",
            location: "",
            manpower: 0,
            title: "",
            description: "",
            bgcolor: "",
            tasks: [],
            index: 0,
          },
        ],
      }}
      initialState={{
        pinnedColumns: {
          left: ["stand"],
        },
      }}
      slots={{
        cell: Cell,
      }}
      slotProps={{
        cell: {
          view: view,
        },
      }}
      getRowId={(row: Facility) => row.id}
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
        height: "fit-content",
        border: "none",
        "& .MuiDataGrid-cell": {
          all: "unset",
          "&:focus": {
            all: "unset",
            outline: "none",
          },
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
