import {
  ArrowBack,
  ArrowForward,
  Delete,
  Edit,
  Flag,
  Visibility,
} from "@mui/icons-material"
import { IconButton, Stack, Typography } from "@mui/material"
import _ from "lodash"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { removeDeadlineStart } from "../../slices/deadlines"
import { deleteTaskStart, taskId } from "../../slices/tasks"
import { Accordion } from "../Accordion"
import { AddCollabModal } from "../AddCollabModal"
import { CreateDeadlineModal } from "../CreateDeadlineModal"
import { CreateFacilityModal } from "../CreateFacilityModal"
import { CreateProjectModal } from "../CreateProjectModal"
import { CreateTaskModal } from "../CreateTaskModal"
import { CreateWorkspaceModal } from "../CreateWorkspaceModal"
import { ResolveInviteModal } from "../ResolveInviteModal"
import { ViewInviteModal } from "../ViewInviteModal"
import { RaportModal } from "../RaportModal"
import { workspaceId } from "../../slices/workspaces"
import { projectId } from "../../slices/projects"
import { inviteId } from "../../slices/invites"

export type Item =
  | ""
  | "task"
  | "facility"
  | "deadline"
  | "workspace"
  | "project"
  | "collaborator"
  | "invite-view"
  | "invite-resolve"
  | "raport"

export interface Modal {
  open: boolean
  item: Item
  taskId?: taskId
  inviteId?: inviteId
  facilityId?: string
  deadlineId?: string
  projectId: projectId
  workspaceId: workspaceId
}

export function DataPanel() {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true)
  const [modal, setModal] = useState<Modal | null>(null)
  const [overItem, setOverItem] = useState<string | null>(null)

  const dispatch = useAppDispatch()

  const user = useAppSelector((state) => state.user.user)
  const workspaces = useAppSelector((state) => state.workspaces.workspaces)
  const projects = useAppSelector((state) => state.projects.projects)
  const tasks = useAppSelector((state) => state.tasks.tasks)
  const facilities = useAppSelector((state) => state.facilities.facilities)
  const deadlines = useAppSelector((state) => state.deadlines.deadlines)
  const invites = useAppSelector((state) => state.invites.invites)

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
            taskId={modal.taskId}
          />
        )
      case "facility":
        return (
          <CreateFacilityModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            facilityId={modal.facilityId}
          />
        )

      case "deadline":
        return (
          <CreateDeadlineModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            projectId={modal.projectId}
            deadlineId={modal.deadlineId}
          />
        )
      case "collaborator":
        return (
          <AddCollabModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            projectId={modal.projectId}
          />
        )
      case "invite-resolve":
        return (
          <ResolveInviteModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            projectId={modal.projectId}
            inviteId={modal.inviteId}
          />
        )
      case "invite-view":
        return (
          <ViewInviteModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            projectId={modal.projectId}
            inviteId={modal.inviteId}
          />
        )
      case "raport":
        return (
          <RaportModal
            setModal={setModal}
            open={true}
            workspaceId={modal.workspaceId}
            projectId={modal.projectId}
            taskId={modal.taskId}
            inviteId={modal.inviteId}
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
              summary="Moje zakłady"
              variant="collection"
              setModal={setModal}
              item="workspace"
            >
              {Object.values(workspaces)
                .filter((workspace) => !workspace.inviteId)
                .map((workspace) => (
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
                        ? Object.values(projects[workspace.id]).map(
                            (project) => (
                              <Accordion
                                summary={project.title}
                                variant="document"
                                item="project"
                                projectId={project.id}
                                workspaceId={workspace.id}
                                key={project.id}
                                userId={project.ownerId}
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
                                            onMouseEnter={() =>
                                              setOverItem(task.id)
                                            }
                                            onMouseLeave={() =>
                                              setOverItem(null)
                                            }
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
                                            {overItem == task.id ? (
                                              <Stack direction="row">
                                                <IconButton
                                                  onClick={() =>
                                                    setModal({
                                                      open: true,
                                                      item: "raport",
                                                      taskId: task.id,
                                                      inviteId: task.inviteId,
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
                                                  <Flag
                                                    sx={{ fontSize: "14px" }}
                                                  />
                                                </IconButton>
                                                <IconButton
                                                  onClick={() =>
                                                    setModal({
                                                      open: true,
                                                      item: "task",
                                                      taskId: task.id,
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
                                                  <Edit
                                                    sx={{ fontSize: "14px" }}
                                                  />
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
                                                  <Delete
                                                    sx={{ fontSize: "14px" }}
                                                  />
                                                </IconButton>
                                              </Stack>
                                            ) : null}
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
                                  {deadlines[project.id]
                                    ? Object.values(deadlines[project.id]).map(
                                        (deadline) => (
                                          <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            key={deadline.id}
                                          >
                                            <Typography
                                              pl={3}
                                              py={1.2}
                                              key={deadline.id}
                                              noWrap
                                              variant="body2"
                                            >
                                              {deadline.title}
                                            </Typography>
                                            <Stack direction="row">
                                              <IconButton
                                                onClick={() =>
                                                  setModal({
                                                    open: true,
                                                    item: "deadline",
                                                    deadlineId: deadline.id,
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
                                                <Edit
                                                  sx={{ fontSize: "14px" }}
                                                />
                                              </IconButton>
                                              <IconButton
                                                onClick={() =>
                                                  dispatch(
                                                    removeDeadlineStart(
                                                      deadline,
                                                    ),
                                                  )
                                                }
                                                sx={{
                                                  "&:focus": {
                                                    outline: "none",
                                                  },
                                                  height: "fit-content",
                                                }}
                                              >
                                                <Delete
                                                  sx={{ fontSize: "14px" }}
                                                />
                                              </IconButton>
                                            </Stack>
                                          </Stack>
                                        ),
                                      )
                                    : null}
                                </Accordion>
                                <Accordion
                                  summary="Współpracownicy"
                                  variant="collection"
                                  setModal={setModal}
                                  item="collaborator"
                                  border={false}
                                  projectId={project.id}
                                  workspaceId={workspace.id}
                                >
                                  {Object.values(invites)
                                    .filter((invite) => {
                                      return (
                                        invite.invitedUserEmail == user?.id &&
                                        invite.projectId === project.id &&
                                        invite.status === "accepted" &&
                                        project.invitedUsers.includes(
                                          invite.invitedUserId,
                                        )
                                      )
                                    })
                                    .map((invite) => (
                                      <Stack
                                        direction="row"
                                        width="100%"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        key={invite.id}
                                      >
                                        <Typography
                                          pl={3}
                                          py={1.2}
                                          key={invite.id}
                                          noWrap
                                          variant="body2"
                                        >
                                          {invite.invitedUserEmail}
                                        </Typography>
                                      </Stack>
                                    ))}
                                </Accordion>
                              </Accordion>
                            ),
                          )
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
            <Accordion
              summary="Zakłady (współpraca)"
              variant="collection"
              setModal={setModal}
              item="deadline"
              border={true}
              displayAdd={false}
            >
              {Object.values(workspaces)
                .filter(
                  (workspace) =>
                    workspace.inviteId &&
                    invites[workspace.inviteId].status === "accepted",
                )
                .map((workspace) => (
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
                      displayAdd={false}
                    >
                      {!_.isEmpty(projects[workspace.id])
                        ? Object.values(projects[workspace.id]).map(
                            (project) => (
                              <Accordion
                                summary={
                                  project.title +
                                  " (" +
                                  invites[project.inviteId || ""].permissions +
                                  ")"
                                }
                                variant="document"
                                item="project"
                                projectId={project.id}
                                workspaceId={workspace.id}
                                key={project.id}
                                userId={project.ownerId}
                              >
                                <Accordion
                                  summary="Zadania"
                                  variant="collection"
                                  setModal={setModal}
                                  item="task"
                                  border={false}
                                  projectId={project.id}
                                  workspaceId={workspace.id}
                                  displayAdd={
                                    invites[project.inviteId || ""]
                                      .permissions == "edycja"
                                  }
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
                                              {invites[project.inviteId || ""]
                                                .permissions == "edycja" ||
                                              invites[project.inviteId || ""]
                                                .permissions ==
                                                "raportowanie" ? (
                                                <IconButton
                                                  onClick={() =>
                                                    setModal({
                                                      open: true,
                                                      item: "raport",
                                                      taskId: task.id,
                                                      inviteId: task.inviteId,
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
                                                  <Flag
                                                    sx={{ fontSize: "14px" }}
                                                  />
                                                </IconButton>
                                              ) : null}
                                              <IconButton
                                                onClick={() =>
                                                  setModal({
                                                    open: true,
                                                    item: "task",
                                                    taskId: task.id,
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
                                                <Edit
                                                  sx={{ fontSize: "14px" }}
                                                />
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
                                                <Delete
                                                  sx={{ fontSize: "14px" }}
                                                />
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
                                  displayAdd={
                                    invites[project.inviteId || ""]
                                      .permissions == "edycja"
                                  }
                                >
                                  {deadlines[project.id]
                                    ? Object.values(deadlines[project.id]).map(
                                        (deadline) => (
                                          <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            key={deadline.id}
                                          >
                                            <Typography
                                              pl={3}
                                              py={1.2}
                                              key={deadline.id}
                                              noWrap
                                              variant="body2"
                                            >
                                              {deadline.title}
                                            </Typography>
                                            <Stack direction="row">
                                              <IconButton
                                                onClick={() =>
                                                  setModal({
                                                    open: true,
                                                    item: "deadline",
                                                    deadlineId: deadline.id,
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
                                                <Edit
                                                  sx={{ fontSize: "14px" }}
                                                />
                                              </IconButton>
                                              <IconButton
                                                onClick={() =>
                                                  dispatch(
                                                    removeDeadlineStart(
                                                      deadline,
                                                    ),
                                                  )
                                                }
                                                sx={{
                                                  "&:focus": {
                                                    outline: "none",
                                                  },
                                                  height: "fit-content",
                                                }}
                                              >
                                                <Delete
                                                  sx={{ fontSize: "14px" }}
                                                />
                                              </IconButton>
                                            </Stack>
                                          </Stack>
                                        ),
                                      )
                                    : null}
                                </Accordion>
                                <Accordion
                                  summary="Współpracownicy"
                                  variant="collection"
                                  setModal={setModal}
                                  item="collaborator"
                                  border={false}
                                  projectId={project.id}
                                  workspaceId={workspace.id}
                                  displayAdd={false}
                                >
                                  {Object.values(invites)
                                    .filter((invite) => {
                                      return (
                                        invite.invitedUserEmail == user?.id &&
                                        invite.projectId === project.id &&
                                        invite.status === "accepted" &&
                                        project.invitedUsers.includes(
                                          invite.invitedUserId,
                                        )
                                      )
                                    })
                                    .map((invite) => (
                                      <Stack
                                        direction="row"
                                        width="100%"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        key={invite.id}
                                      >
                                        <Typography
                                          pl={3}
                                          py={1.2}
                                          key={invite.id}
                                          noWrap
                                          variant="body2"
                                        >
                                          {invite.invitedUserEmail}
                                        </Typography>
                                      </Stack>
                                    ))}
                                </Accordion>
                              </Accordion>
                            ),
                          )
                        : null}
                    </Accordion>
                    <Accordion
                      summary="Stanowiska"
                      variant="collection"
                      setModal={setModal}
                      item="facility"
                      border={false}
                      workspaceId={workspace.id}
                      displayAdd={false}
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
            <Accordion
              summary="Zaproszenia"
              variant="collection"
              setModal={setModal}
              item="deadline"
              border={false}
              displayAdd={false}
            >
              <Accordion
                summary="Oczekujące"
                variant="document"
                setModal={setModal}
                item="deadline"
                border={false}
              >
                {Object.values(invites)
                  .filter((invite) => {
                    return (
                      invite.type == "incoming" && invite.status == "pending"
                    )
                  })
                  .map((invite) => (
                    <Stack
                      direction="row"
                      width="100%"
                      alignItems="center"
                      justifyContent="space-between"
                      key={invite.id}
                    >
                      <Typography
                        pl={3}
                        py={1.2}
                        key={invite.id}
                        noWrap
                        variant="body2"
                      >
                        {invite.invitingUserEmail}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          setModal({
                            open: true,
                            item: "invite-resolve",
                            inviteId: invite.id,
                            projectId: invite.projectId,
                            workspaceId: invite.workspaceId,
                          })
                        }
                        sx={{
                          "&:focus": {
                            outline: "none",
                          },
                          height: "fit-content",
                        }}
                      >
                        <Visibility sx={{ fontSize: "16px" }} />
                      </IconButton>
                    </Stack>
                  ))}
              </Accordion>
              <Accordion
                summary="Wysłane"
                variant="document"
                setModal={setModal}
                item="deadline"
                border={false}
              >
                {Object.values(invites)
                  .filter((invite) => {
                    return invite.type == "outgoing"
                  })
                  .map((invite) => (
                    <Stack
                      direction="row"
                      width="100%"
                      alignItems="center"
                      justifyContent="space-between"
                      key={invite.id}
                    >
                      <Typography
                        pl={3}
                        py={1.2}
                        key={invite.id}
                        noWrap
                        variant="body2"
                      >
                        {invite.invitedUserEmail}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          setModal({
                            open: true,
                            item: "invite-view",
                            inviteId: invite.id,
                            projectId: invite.projectId,
                            workspaceId: invite.workspaceId,
                          })
                        }
                        sx={{
                          "&:focus": {
                            outline: "none",
                          },
                          height: "fit-content",
                        }}
                      >
                        <Visibility sx={{ fontSize: "16px" }} />
                      </IconButton>
                    </Stack>
                  ))}
              </Accordion>
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
