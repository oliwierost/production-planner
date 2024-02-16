import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Stack, Typography } from "@mui/material";
import { Task, deleteTaskStart, setTaskDroppedStart } from "../../slices/tasks";
import { ContextMenu } from "../ContextMenu";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setDragDisabled } from "../../slices/drag";

interface DroppedTaskProps {
  task: Task;
  cellWidth: number;
  left: number | undefined;
  width: number | undefined;
  rowId: string | number;
  colId: number;
}

export function DroppedTask({
  task,
  cellWidth,
  left,
  width,
  rowId,
  colId,
}: DroppedTaskProps) {
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [isGridUpdated, setIsGridUpdated] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0 });

  const dispatch = useAppDispatch();
  const view = useAppSelector((state) => state.view.view);
  const cellSpan = task.duration;

  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (view?.name !== "1 mies.") return;
    if (!anchorEl) {
      setCursorPosition({ left: event.clientX - 2, top: event.clientY - 4 });
      setAnchorEl(event.currentTarget);
      dispatch(setDragDisabled(true));
    }
  };
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
    dispatch(setDragDisabled(false));
  };

  const contextMenuOptions = [
    {
      title: "Edytuj",
      onClick: () => {
        setModalOpen("updateTask");
        handleClose();
        dispatch(setDragDisabled(true));
      },
      icon: <EditIcon fontSize="small" />,
    },
    {
      title: "Usuń z osi czasu",
      onClick: () => {
        dispatch(
          setTaskDroppedStart({
            taskId: task.id,
            dropped: false,
            rowId: rowId as string,
            colId,
            cellSpan,
          })
        );
        setIsGridUpdated(true);
        handleClose();
      },
      icon: <DeleteIcon fontSize="small" />,
    },
    {
      title: "Usuń",
      onClick: () => {
        dispatch(
          deleteTaskStart({
            taskId: task.id,
            facilityId: rowId as string,
            colId,
            cellSpan,
          })
        );
        setIsGridUpdated(true);
        handleClose();
      },
      icon: <DeleteForeverIcon fontSize="small" />,
    },
  ];

  return (
    <>
      {task ? (
        <Stack
          onContextMenu={(e) => handleRightClick(e)}
          key={task.id}
          width={width ? width : cellWidth * task.duration}
          height="2rem"
          justifyContent="center"
          position="absolute"
          top="50%"
          left={left}
          sx={{
            zIndex: 20,
            transform: "translateY(-50%)",
            boxSizing: "border-box",
            bgcolor: task.bgcolor,
            color: "black",
            borderRadius: 1,
            border: "1px solid black",
          }}
        >
          {task.title ? (
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{
                maxWidth: "100%",
                boxSizing: "border-box",
                textOverflow: "ellipsis",
                overflow: "hidden",
                px: "min(20px, 10%)",
              }}
            >
              {task.title}
            </Typography>
          ) : null}
          <ContextMenu
            options={contextMenuOptions}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            isGridUpdated={isGridUpdated}
            setIsGridUpdated={setIsGridUpdated}
            open={open}
            cursorPosition={cursorPosition}
            onClose={handleClose}
            item={task}
          />
        </Stack>
      ) : null}
    </>
  );
}
