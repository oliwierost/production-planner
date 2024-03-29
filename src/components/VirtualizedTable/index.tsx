import React, { useEffect, useState } from "react"

import { StickyGrid } from "../StickyGrid"
import { Stand } from "../../../types/stand"
import { HeadCell, SideCell, DataCell } from "../Cell"
import { createSnapModifier } from "@dnd-kit/modifiers"

interface CellProps {
  columnIndex: number
  rowIndex: number
  style: React.CSSProperties
}

interface VirtualizedTableProps {
  stands: Stand[]

  cellStateMap: any
  draggedTask: any
}

export const VirtualizedTable = ({
  stands,

  cellStateMap,
  draggedTask,
}: VirtualizedTableProps) => {
  const [dateRange, setDateRange] = useState<string[]>([])
  const [hourRange, setHourRange] = useState<string[]>([])
  const [weekRange, setWeekRange] = useState<string[]>([])
  const [cellWidth, setCellWidth] = useState<number>(100)
  const numberOfDays: number = 20

  const handleZoom = (event) => {
    // Check if the "Ctrl" key is pressed
    if (event.metaKey) {
      event.preventDefault()
      // Zoom in
      if (event.deltaY < 0) {
        setCellWidth((cellWidth) =>
          cellWidth >= 200 ? cellWidth : cellWidth + 2
        )
      }
      // Zoom out
      if (event.deltaY > 0) {
        setCellWidth((cellWidth) =>
          cellWidth <= 50 ? cellWidth : cellWidth - 2
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

  const generateDateRange = (numberOfDays: number): string[] => {
    const currentDate = new Date()
    const dateRange = Array.from({ length: numberOfDays }, (_, index) => {
      const date = new Date(currentDate)
      date.setDate(currentDate.getDate() + index)
      return date.toLocaleDateString("en-GB")
    })
    return dateRange
  }

  const generateHourRange = (numberOfDays: number): string[] => {
    //return an array of repeated numbers from 0 to 23
    const hourRange = Array.from({ length: numberOfDays * 24 }, (_, index) => {
      return (index % 24) + ":00"
    })
    return hourRange
  }

  const generateWeekRange = (numberOfDays: number): string[] => {
    const weekRange = Array.from(
      { length: numberOfDays },
      (_, index) => index + 1
    ).map((week) => "Week " + week)
    return weekRange
  }

  useEffect(() => {
    const dateRange = generateDateRange(numberOfDays)
    const hourRange = generateHourRange(numberOfDays)
    const weekRange = generateWeekRange(numberOfDays)
    setDateRange(dateRange)
    setHourRange(hourRange)
    setWeekRange(weekRange)
  }, [])

  const renderCell = ({ columnIndex, rowIndex, style }: CellProps) => {
    //first col except first row
    if (columnIndex == 0 && rowIndex != 0) {
      return <SideCell style={style} stands={stands} rowIndex={rowIndex} />
    }
    //first row except first col
    if (rowIndex == 0) {
      return (
        <HeadCell
          style={style}
          columnIndex={columnIndex}
          rowIndex={rowIndex}
          hourRange={hourRange}
          dateRange={dateRange}
          weekRange={weekRange}
        />
      )
    } else {
      return (
        <DataCell
          style={style}
          columnIndex={columnIndex}
          rowIndex={rowIndex}
          cellStateMap={cellStateMap}
          draggedTask={draggedTask}
          cellWidth={cellWidth}
        />
      )
    }
  }

  return (
    <StickyGrid
      columnCount={dateRange?.length * 24 * 4 + 1}
      columnWidth={() => 100}
      height={1000}
      rowCount={stands?.length + 1}
      rowHeight={() => 50}
      width={window.innerWidth}
      cellWidth={cellWidth}
    >
      {renderCell}
    </StickyGrid>
  )
}
