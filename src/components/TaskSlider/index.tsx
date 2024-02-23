import { Stack, Divider } from "@mui/material"
import { Task } from "../Task"
import { useRef } from "react"
import { Draggable } from "../Draggable"
import { useAppSelector } from "../../hooks"
import { DroppedTask } from "../DroppedTask"

export function TaskSlider() {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const tasksState = useAppSelector((state) => state.tasks)
  const dragState = useAppSelector((state) => state.drag)
  const taskArr = Object.entries(tasksState.tasks)
    .filter(([, task]) => !task.dropped)
    .sort((a, b) => {
      if (a[1].bgcolor < b[1].bgcolor) {
        return -1
      }
      if (a[1].bgcolor > b[1].bgcolor) {
        return 1
      }
      return 0
    })

  return (
    <Stack width="100%">
      <Stack
        ref={outerRef}
        direction="row"
        px={2}
        py={1}
        minHeight={80}
        overflow="scroll"
        borderTop="1px solid #000000"
        borderBottom="1px solid #000000"
        bgcolor="#EFEFEF"
        sx={{
          scrollbarWidth: "thin",
          scrollbarColor: "#5A5A5A #EFEFEF", // thumb color and track color
          "&::-webkit-scrollbar": {
            width: "100%",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#5A5A5A", // thumb color
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#D9D9D9", // track color
            borderTop: "1px solid #000000",
          },
        }}
      >
        <Stack spacing={2} direction="row" ref={innerRef}>
          {taskArr.map(([id, task], idx) => (
            <Stack direction="row" key={id} spacing={2}>
              <Draggable id={id} data={{ task, source: null, state: null }}>
                {dragState.over && dragState.draggedTask == task.id ? (
                  <DroppedTask task={task} cellWidth={100} />
                ) : (
                  <Task task={task} />
                )}
              </Draggable>
              {idx !== taskArr.length - 1 && (
                <Divider
                  orientation="vertical"
                  sx={{
                    bgcolor: "#1E1E1E87",
                    width: "2px",
                    borderRadius: "2px",
                  }}
                />
              )}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}
