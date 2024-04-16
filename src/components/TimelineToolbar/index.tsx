import { FileDownload, FileDownloadOff } from "@mui/icons-material"
import { Stack, ToggleButton } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { selectWorkspace } from "../../selectors/workspaces"
import { setDisplayArrowsStart } from "../../slices/workspaces"
import { ToggleView } from "../ToggleView"

export function TimelineToolbar() {
  const dispatch = useAppDispatch()
  const workspaceId = useAppSelector(
    (state) => state.user.user?.openWorkspaceId,
  )
  const workspace = useAppSelector((state) =>
    selectWorkspace(state, workspaceId),
  )
  return (
    <Stack
      direction="row"
      width="100%"
      bgcolor="lightgrey"
      alignItems="center"
      justifyContent="space-between"
      borderBottom="1px solid #000000"
    >
      {workspace ? (
        <ToggleButton
          value="logout"
          selected={workspace.displayArrows}
          onChange={() =>
            dispatch(
              setDisplayArrowsStart({
                workspaceId: workspace.id,
                displayArrows: !workspace.displayArrows,
              }),
            )
          }
          sx={{
            px: 0.5,
            py: 0.6,
            bgcolor: "lightgrey",
            border: "none",
            rotate: "-90deg",
            "&:focus": {
              outline: "none",
            },
          }}
        >
          {!workspace.displayArrows ? <FileDownloadOff /> : <FileDownload />}
        </ToggleButton>
      ) : null}
      <ToggleView />
    </Stack>
  )
}
