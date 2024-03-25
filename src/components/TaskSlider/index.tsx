import { Stack, Divider, Box } from "@mui/material"
import { Draggable } from "../Draggable"
import { useAppSelector } from "../../hooks"
import { Task } from "../Task"
import { selectTasks } from "../../selectors/tasks"
import _ from "lodash"

export function TaskSlider() {
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)
  const tasks = useAppSelector((state) => selectTasks(state, projectId))

  return (
    <Stack width="100%">
      <Stack
        direction="row"
        px={2}
        py={1}
        minHeight={80}
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
          {!_.isEmpty(tasks)
            ? Object.values(tasks).map((task) => (
                <Box key={task.id}>
                  {!task.startTime || !task.facilityId ? (
                    <Box key={task.id}>
                      <Draggable id={task.id} data={{ task, sourceId: null }}>
                        <Task task={task} />
                      </Draggable>
                      {task.dragged ? (
                        <Box sx={{ opacity: 0.5 }}>
                          <Task task={task} />
                        </Box>
                      ) : null}
                    </Box>
                  ) : null}
                </Box>
              ))
            : null}
        </Stack>
      </Stack>
    </Stack>
  )
}
