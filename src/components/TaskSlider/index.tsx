import { Stack, Divider, Box } from "@mui/material"
import { Draggable } from "../Draggable"
import { useAppSelector } from "../../hooks"
import { Task } from "../Task"
import { selectTasks } from "../../selectors/tasks"
import _ from "lodash"

export function TaskSlider() {
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)
  const tasks = useAppSelector((state) => selectTasks(state, projectId))
  const draggedTask = useAppSelector((state) => state.drag.draggedTask)

  return (
    <Stack width="100%">
      <Stack
        direction="row"
        px={2}
        py={1}
        minHeight={80}
        maxHeight={80}
        overflow="scroll"
        borderTop="1px solid #000000"
        borderBottom="1px solid #000000"
        boxSizing="border-box"
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
        <Stack direction="row" minHeight={60} spacing={2}>
          {!_.isEmpty(tasks)
            ? Object.values(tasks)
                .filter((task) => !task.startTime && !task.facilityId)
                .map((task) => (
                  <Box key={task.id}>
                    <Box key={task.id} position="relative">
                      <Draggable id={task.id} data={{ task, sourceId: null }}>
                        <Task task={task} />
                      </Draggable>
                      {task.id === draggedTask?.id ? (
                        <Box
                          sx={{
                            opacity: 0.5,
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <Task task={task} />
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                ))
            : null}
        </Stack>
      </Stack>
    </Stack>
  )
}
