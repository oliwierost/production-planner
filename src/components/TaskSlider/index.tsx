import { Task as TaskType } from "../../../types/task";
import { Stack, Divider } from "@mui/material";
import { Task } from "../Task";
import { useRef } from "react";
import { Draggable } from "../Draggable";
import { Task as GridTaskType } from "../../App";

interface TaskSliderProps {
  tasks: Array<TaskType | GridTaskType>;
}

export function TaskSlider({ tasks }: TaskSliderProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <Stack width="100%">
      <Stack
        ref={outerRef}
        direction="row"
        px={2}
        py={1}
        overflow="scroll"
        borderTop="1px solid #000000"
        borderBottom="1px solid #000000"
        bgcolor="#EFEFEF"
        sx={{
          scrollbarWidth: "thin",
          scrollbarColor: "#333333 #EFEFEF", // thumb color and track color
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
          {tasks.map((task, idx) => (
            <Stack direction="row" key={task.id} spacing={2}>
              <Draggable
                id={task?.id.toString()}
                data={{ task, source: null, state: null }}
              >
                <Task task={task} />
              </Draggable>
              {idx !== tasks.length - 1 && (
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
  );
}
