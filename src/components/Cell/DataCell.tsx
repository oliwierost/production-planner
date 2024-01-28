import { Draggable } from "../Draggable";
import { Droppable } from "../Droppable";
import { Task } from "../Task";
import { DroppedTask, DroppedTaskStart, DroppedTaskEnd } from "./DroppedTask";
import { Stack } from "@mui/material";

interface DataCellProps {
  style: any;
  columnIndex: number;
  rowIndex: number;
  cellStateMap: any;
  draggedTask: any;
}

export function DataCell({
  style,
  columnIndex,
  rowIndex,
  cellStateMap,
  draggedTask,
}: DataCellProps) {
  const data = cellStateMap[`${rowIndex}-${columnIndex}`];
  const { task, state } = cellStateMap[`${rowIndex}-${columnIndex}`];

  const renderTask = () => {
    if (draggedTask.draggableId === `${rowIndex}-${columnIndex}`) {
      return <Task task={task} />;
    } else if (
      draggedTask.draggableId !== `${rowIndex}-${columnIndex}` &&
      draggedTask?.task?.id == task?.id
    ) {
      return <div style={{ color: "transparent" }}>/</div>;
    } else {
      switch (state) {
        case "occupied":
          return <DroppedTask task={task} />;
        case "occupied-start":
          return <DroppedTaskStart task={task} />;
        case "occupied-end":
          return <DroppedTaskEnd task={task} />;
        default:
          return <div style={{ color: "transparent" }}>/</div>;
      }
    }
  };
  return (
    <Stack
      justifyContent="center"
      style={{
        ...style,
        backgroundColor: "white",
        boxSizing: "border-box",
        borderRight: "1px solid #D9D9D9",
        borderBottom: "1px solid black",
        maxHeight: 50,
        marginTop: 50,
        background: "white",
      }}
    >
      <Droppable id={`${rowIndex}-${columnIndex}`}>
        <Draggable
          id={`${rowIndex}-${columnIndex}`}
          scroll={{ x: 0, y: 0 }}
          data={data}
        >
          {renderTask()}
        </Draggable>
      </Droppable>
    </Stack>
  );
}
