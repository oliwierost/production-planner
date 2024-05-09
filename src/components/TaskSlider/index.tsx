import { Box, Stack } from "@mui/material"
import _ from "lodash"
import { useAppSelector } from "../../hooks"
import { selectTasks } from "../../selectors/tasks"
import { Draggable } from "../Draggable"
import { DraggedTask } from "../DraggedTask"
import { Task } from "../Task"

export function TaskSlider() {
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)
  const tasks = useAppSelector((state) => selectTasks(state, projectId))
  const draggedTask = useAppSelector((state) => state.drag.draggedTask)
  const cellWidth = useAppSelector((state) => state.view.view?.cellWidth)

  const filteredTasks = !_.isEmpty(tasks)
    ? Object.values(tasks)
        .filter((task) => !task.startTime || !task.facilityId)
        .sort((a, b) => {
          //sort by color
          if (a.bgcolor < b.bgcolor) {
            return -1
          }
          if (a.bgcolor > b.bgcolor) {
            return 1
          }
          return 0
        })
    : []

  // State to manage the animation of height
  return (
    <Stack width="100%">
      <Stack
        alignItems="center"
        direction="row"
        px={2}
        overflow="scroll"
        boxSizing="border-box"
        bgcolor="#EFEFEF"
        borderBottom={filteredTasks.length > 0 ? "1px solid black" : "none"}
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
          // Apply transition to height property
          transition: "height 0.15s ease",
          height: filteredTasks.length > 0 ? "95px" : "0px",
        }}
      >
        <Stack direction="row" minHeight={60} spacing={2}>
          {filteredTasks.map((task) => (
            <Box key={task.id}>
              <Box key={task.id} position="relative">
                <Draggable id={task.id} data={{ task, sourceId: null }}>
                  {draggedTask?.id !== task.id ? (
                    <Task task={task} />
                  ) : (
                    <Box maxWidth={cellWidth}>
                      <DraggedTask task={task} />
                    </Box>
                  )}
                </Draggable>
                {task.id === draggedTask?.id ? (
                  <Box
                    sx={{
                      opacity: 0.5,
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Task task={task} />
                  </Box>
                ) : null}
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}
