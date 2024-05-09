import { Box, Tooltip as MuiTooltip, Stack, Typography } from "@mui/material"
import { ReactElement } from "react"
import { useAppSelector } from "../../hooks"
import { selectWorkspace } from "../../selectors/workspaces"
import { Facility } from "../../slices/facilities"

interface TooltipProps {
  children: ReactElement<any, any>
  facility: Facility
  open: boolean
}

export function FacilityTooltip({ children, facility, open }: TooltipProps) {
  const workspace = useAppSelector((state) =>
    selectWorkspace(state, facility.workspaceId),
  )

  return (
    <MuiTooltip
      followCursor
      open={open}
      title={
        <Stack spacing={2} direction="row">
          <Stack>
            <Typography variant="body2" lineHeight="20px">
              Nazwa:
            </Typography>
            <Typography variant="body2" lineHeight="20px">
              Zakład:
            </Typography>
            <Typography variant="body2" lineHeight="20px">
              Siła robocza:
            </Typography>
            <Typography variant="body2" lineHeight="20px">
              Kolor:
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="body2" lineHeight="20px" fontWeight={600}>
              {facility.title}
            </Typography>
            <Typography variant="body2" lineHeight="20px" fontWeight={600}>
              {workspace?.title}
            </Typography>
            <Typography variant="body2" lineHeight="20px" fontWeight={600}>
              {facility?.manpower}
            </Typography>
            <Box
              bgcolor={facility.bgcolor}
              width={20}
              height={20}
              borderRadius={1}
              justifyContent="center"
              alignItems="center"
              sx={{
                cursor: "pointer",
                boxSizing: "border-box",
                border: "1px solid #1D1D1D",
              }}
            />
          </Stack>
        </Stack>
      }
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "#f5f5f9",
            color: "rgba(0, 0, 0, 0.87)",
            border: "1px solid #dadde9",
          },
        },
      }}
    >
      {children}
    </MuiTooltip>
  )
}
