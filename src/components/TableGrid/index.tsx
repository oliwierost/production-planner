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

export interface TableGridProps {
  setContainer: Dispatch<SetStateAction<Container>>
}

export function TableGrid({ setContainer }: TableGridProps) {
  const [sortedFacilities, setSortedFacilities] = useState<Facility[]>([])
  const facilities = useAppSelector((state) => state.facilities.facilities)
  const viewState = useAppSelector((state) => state.view)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollableRef = useRef<HTMLDivElement | null>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!viewState.loading && viewState.view === null) {
      console.log("generating monthly view")
      dispatch(
        setMonthView({ view: generateMonthView(1000), grid: { cells: {} } }),
      )
    }
  }, [viewState, dispatch])

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      const scrollable = scrollableRef.current

      if (container && scrollable) {
        setContainer({
          left: container.offsetLeft,
          top: container.offsetTop,
          scrollX: scrollable.scrollLeft,
          scrollY: scrollable.scrollTop,
        })
        console.log(container)
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
      <Box position="fixed" zIndex={999}>
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
            }}
          >
            {sortedFacilities.map((facility: Facility) => (
              <SideCell key={facility.id} facility={facility} />
            ))}
          </Stack>
          <Box position="absolute" top="50px" left="225px" ref={containerRef}>
            <Droppable id="timeline">
              {sortedFacilities.map((_, idx) => (
                <Box
                  key={idx}
                  height="50px"
                  borderBottom="1px solid black"
                  width={viewState.view!.headerBottomData.length * 100}
                  boxSizing="border-box"
                />
              ))}
            </Droppable>
          </Box>
        </>
      ) : null}
    </Stack>
  )
}
