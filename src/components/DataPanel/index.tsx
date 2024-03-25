import { ArrowBack, ArrowForward, Delete, Edit } from "@mui/icons-material"
import { IconButton, Stack, Typography } from "@mui/material"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { Accordion } from "../Accordion"
import _ from "lodash"
import { CreateTaskModal } from "../CreateTaskModal"
import { CreateFacilityModal } from "../CreateFacilityModal"
import { CreateDeadlineModal } from "../CreateDeadlineModal"
import { CreateWorkspaceModal } from "../CreateWorkspaceModal"
import { CreateProjectModal } from "../CreateProjectModal"
import { deleteTaskStart } from "../../slices/tasks"

export type Item =
  | ""
  | "task"
  | "activity"
  | "location"
  | "facility"
  | "deadline"
  | "group"
  | "workspace"
  | "project"

export interface Modal {
  open: boolean
  item: Item
  itemId?: string
  projectId: string
  workspaceId: string
}

export function DataPanel() {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true)
  const [modal, setModal] = useState<Modal | null>(null)

  const dispatch = useAppDispatch()

  const workspaces = useAppSelector((state) => state.workspaces.workspaces)
  const projects = useAppSelector((state) => state.projects.projects)
  const tasks = useAppSelector((state) => state.tasks.tasks)
  const facilities = useAppSelector((state) => state.facilities.facilities)

  const renderModal = () => {
    if (!modal) return null
    switch (modal.item) {
      case "workspace":
        return <CreateWorkspaceModal setModal={setModal} open={true} />
      case "project":
        return (
          <CreateProjectModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
          />
        )
      case "task":
        return (
          <CreateTaskModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            projectId={modal.projectId}
            taskId={modal.itemId}
          />
        )
      case "facility":
        return (
          <CreateFacilityModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            facilityId={modal.itemId}
          />
        )

      case "deadline":
        return (
          <CreateDeadlineModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            projectId={modal.projectId}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      {renderModal()}
      {isPanelOpen ? (
        <Stack
          minWidth="350px"
          height="100%"
          sx={{
            height: "100%",
            overflowY: "scroll",
            borderRight: "1px solid black",
            boxSizing: "border-box",
            backgroundColor: "grey.200",
          }}
        >
          <Stack
            width="100%"
            height="fit-content"
            alignItems="end"
            justifyContent="center"
            sx={{
              borderBottom: "1px solid black",
              boxSizing: "border-box",
              pr: 1,
            }}
          >
            <IconButton
              onClick={() => setIsPanelOpen(false)}
              sx={{
                "&:focus": {
                  outline: "none",
                },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Stack>
          <Stack
            sx={{
              height: "100%",
              overflowY: "scroll",
              boxSizing: "border-box",
              p: 2,
            }}
          >
            <Accordion
              summary="Zakłady"
              variant="collection"
              setModal={setModal}
              item="workspace"
            >
              {Object.values(workspaces).map((workspace) => (
                <Accordion
                  summary={workspace.title}
                  variant="document"
                  item="workspace"
                  key={workspace.id}
                >
                  <Accordion
                    summary="Projekty"
                    variant="collection"
                    setModal={setModal}
                    item="project"
                    workspaceId={workspace.id}
                  >
                    {!_.isEmpty(projects[workspace.id])
                      ? Object.values(projects[workspace.id]).map((project) => (
                          <Accordion
                            summary={project.title}
                            variant="document"
                            item="project"
                            projectId={project.id}
                            workspaceId={workspace.id}
                            key={project.id}
                          >
                            <Accordion
                              summary="Zadania"
                              variant="collection"
                              setModal={setModal}
                              item="task"
                              border={false}
                              projectId={project.id}
                              workspaceId={workspace.id}
                            >
                              {tasks[project.id]
                                ? Object.values(tasks[project.id]).map(
                                    (task) => (
                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        key={task.id}
                                      >
                                        <Typography
                                          pl={3}
                                          py={1.2}
                                          key={task.id}
                                          noWrap
                                          variant="body2"
                                        >
                                          {task.title}
                                        </Typography>
                                        <Stack direction="row">
                                          <IconButton
                                            onClick={() =>
                                              setModal({
                                                open: true,
                                                item: "task",
                                                itemId: task.id,
                                                projectId: project.id,
                                                workspaceId: workspace.id,
                                              })
                                            }
                                            sx={{
                                              "&:focus": {
                                                outline: "none",
                                              },
                                              height: "fit-content",
                                            }}
                                          >
                                            <Edit sx={{ fontSize: "14px" }} />
                                          </IconButton>
                                          <IconButton
                                            onClick={() =>
                                              dispatch(
                                                deleteTaskStart({
                                                  task,
                                                }),
                                              )
                                            }
                                            sx={{
                                              "&:focus": {
                                                outline: "none",
                                              },
                                              height: "fit-content",
                                            }}
                                          >
                                            <Delete sx={{ fontSize: "14px" }} />
                                          </IconButton>
                                        </Stack>
                                      </Stack>
                                    ),
                                  )
                                : null}
                            </Accordion>
                            <Accordion
                              summary="Terminy"
                              variant="collection"
                              setModal={setModal}
                              item="deadline"
                              border={false}
                              projectId={project.id}
                              workspaceId={workspace.id}
                            >
                              <div />
                            </Accordion>
                          </Accordion>
                        ))
                      : null}
                  </Accordion>
                  <Accordion
                    summary="Stanowiska"
                    variant="collection"
                    setModal={setModal}
                    item="facility"
                    border={false}
                    workspaceId={workspace.id}
                  >
                    {facilities[workspace.id]
                      ? Object.values(facilities[workspace.id]).map(
                          (facility) => (
                            <Typography
                              pl={3}
                              py={1.2}
                              key={facility.id}
                              noWrap
                              variant="body2"
                            >
                              {facility.title}
                            </Typography>
                          ),
                        )
                      : null}
                  </Accordion>
                </Accordion>
              ))}
            </Accordion>
          </Stack>
        </Stack>
      ) : (
        <Stack
          minWidth="50px"
          height="100%"
          sx={{
            borderRight: "1px solid black",
            boxSizing: "border-box",
            backgroundColor: "grey.200",
          }}
        >
          <Stack
            width="100%"
            height="50px"
            alignItems="center"
            justifyContent="center"
          >
            <IconButton
              onClick={() => setIsPanelOpen(true)}
              sx={{
                "&:focus": {
                  outline: "none",
                },
              }}
            >
              <ArrowForward />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </>
  )
}
