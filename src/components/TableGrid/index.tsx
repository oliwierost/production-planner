import { Box, Stack } from "@mui/material"
import { SideCell } from "./SideCell"
import { Facility } from "../../slices/facilities"
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react"
import { HeadCell } from "./HeadCell"
import { CornerCell } from "./CornerCell"
import { Droppable } from "../Droppable"
import { Container } from "../../App"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { setMonthView } from "../../slices/view"
import { generateMonthView } from "../../generateView"

import { TaskInTimeline } from "../TaskInTimeline"

export interface TableGridProps {
  setContainer: Dispatch<SetStateAction<Container>>
}

export function TableGrid({ setContainer }: TableGridProps) {
  const [sortedFacilities, setSortedFacilities] = useState<Facility[]>([])
  const facilities = useAppSelector((state) => state.facilities.facilities)
  const viewState = useAppSelector((state) => state.view)
  const tasks = useAppSelector((state) => state.tasks.tasks)
  const drag = useAppSelector((state) => state.drag)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollableRef = useRef<HTMLDivElement | null>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!viewState.loading && viewState.view === null) {
      console.log("generating monthly view")
      dispatch(
        setMonthView({ view: generateMonthView(100), grid: { cells: {} } }),
      )
    }
  }, [viewState, dispatch])

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const boundingRect = container.getBoundingClientRect()
      setContainer((prev) => ({
        ...prev,
        left: boundingRect.left,
        top: boundingRect.top,
      }))
    }
  }, [containerRef.current, setContainer])

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = scrollableRef.current

      // scrollableRef.current && console.log(getCoords(scrollableRef.current))

      if (scrollable) {
        setContainer((prev) => ({
          ...prev,
          scrollX: scrollable.scrollLeft,
          scrollY: scrollable.scrollTop,
        }))
      }
    }

    const scrollable = scrollableRef.current

    if (scrollable) {
      scrollable.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollable) {
        scrollable.removeEventListener("scroll", handleScroll)
      }
    }
  }, [containerRef, scrollableRef, setContainer, dispatch])

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

  return (
    <Stack
      maxWidth="100vw"
      overflow="scroll"
      position="relative"
      ref={scrollableRef}
    >
      <Box position="fixed" zIndex={2}>
        <CornerCell />
      </Box>
      {viewState.view !== null ? (
        <>
          <Stack direction="row" position="sticky" ml="225px" zIndex={1}>
            {viewState.view.headerBottomData.map((column, index) => (
              <HeadCell
                key={index}
                cellWidth={100}
                columnIndex={index}
                topData={viewState.view!.headerTopData}
                bottomLabel={column.headerName}
              />
            ))}
          </Stack>
          <Stack
            sx={{
              position: "sticky",
              left: 0,
              zIndex: 4,
              width: "225px",
            }}
          >
            {Object.values(facilities).map((facility: Facility) => (
              <SideCell key={facility.id} facility={facility} />
            ))}
          </Stack>
          <Box position="absolute" top="50px" left="225px" ref={containerRef}>
            {sortedFacilities.map((_, idx) => (
              <Box
                height={50}
                borderBottom="1px solid black"
                width={viewState.view!.headerBottomData.length * 100}
                boxSizing="border-box"
              />
            ))}
            {Object.values(tasks).map((task) => (
              <Box key={task.id}>
                {task.startTime ? <TaskInTimeline task={task} /> : null}
              </Box>
            ))}
            {drag.draggedTaskId ? (
              <Stack
                direction="row"
                position="fixed"
                height={sortedFacilities.length * 50 - 50}
                pl="25px"
                sx={{
                  //target hover
                  pointerEvents: "none",
                  transform: `translateY(-${
                    sortedFacilities.length * 50 - 25
                  }px)})`,
                }}
                zIndex={1}
              >
                <Box height="100%">
                  <Droppable id="timeline">
                    <Box
                      width={viewState.view!.headerBottomData.length * 100}
                    />
                  </Droppable>
                </Box>
              </Stack>
            ) : null}
          </Box>
        </>
      ) : null}
    </Stack>
  )
}
