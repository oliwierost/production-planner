import { Box, Stack } from "@mui/material"
import { useAppSelector } from "../../hooks"
import { SideCell } from "./SideCell"
import { Facility } from "../../slices/facilities"
import { useEffect, useRef, useState } from "react"
import { generateMonthView } from "../../generateView"
import { HeadCell } from "./HeadCell"
import { CornerCell } from "./CornerCell"
import { Droppable } from "../Droppable"

export function TableGrid({ setContainer }) {
  const [sortedFacilities, setSortedFacilities] = useState<Facility[]>([])
  const facilities = useAppSelector((state) => state.facilities.facilities)
  const [view, setView] = useState(generateMonthView(1000))
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollableRef = useRef<HTMLDivElement | null>(null)

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
    }
  }

  useEffect(() => {
    handleScroll() // Trigger the function initially

    const scrollable = scrollableRef.current

    if (scrollable) {
      scrollable.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollable) {
        scrollable.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

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
      <Stack direction="row" position="sticky" ml="225px" zIndex={1}>
        {view.headerBottomData.map((column, index) => (
          <HeadCell
            key={index}
            cellWidth={100}
            columnIndex={index}
            topData={view.headerTopData}
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
              width={view.headerBottomData.length * 100}
              boxSizing="border-box"
            />
          ))}
        </Droppable>
      </Box>
    </Stack>
  )
}
