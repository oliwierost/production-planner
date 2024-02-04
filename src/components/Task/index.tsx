import { Task as TaskType } from "../../../types/task";
import { Stack, Typography } from "@mui/material";
import { Task as GridTaskType } from "../../App";

interface TaskProps {
  task: TaskType | GridTaskType;
}

export function Task({ task }: TaskProps) {
  return (
    <Stack
      width={50}
      height={50}
      border="1px solid #000000"
      justifyContent="center"
      px={3}
      borderRadius={1}
      sx={{ bgcolor: task.bgcolor, color: "#FFFFFF" }}
    >
      <Typography variant="body1" fontWeight={700}>
        {task.title}
      </Typography>
    </Stack>
  );
}
