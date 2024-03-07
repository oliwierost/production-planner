import { Stack, Divider, Box } from "@mui/material"
import { Task } from "../Task"
import { Draggable } from "../Draggable"
import { useAppSelector } from "../../hooks"

export function TaskSlider() {
  const tasks = useAppSelector((state) => state.tasks.tasks)
  const selectedProject = useAppSelector(
    (state) => state.projects.selectedProject,
  )
  const taskArr = Object.entries(tasks)
    .filter(([, task]) => !task.startTime && task.projectId === selectedProject)
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
        direction="row"
        px={2}
        py={1}
        minHeight={60}
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
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          minHeight={60}
          spacing={2}
        >
          {taskArr.map(([id, task]) => (
            <Box key={id}>
              <Draggable id={id} data={{ task, sourceId: null }}>
                <Task task={task} />
              </Draggable>
              {task.dragged ? (
                <Box sx={{ opacity: 0.5 }}>
                  <Task task={task} />
                </Box>
              ) : null}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}
