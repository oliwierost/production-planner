import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Stack, Typography } from "@mui/material";

interface toolbarIconProps {
  icon: React.ReactNode;
  iconText?: string;
  expandMore?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ToolbarIcon({ icon, iconText, expandMore }: toolbarIconProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      px="1rem"
      height="100%"
      color="#1E1E1E"
      sx={{
        cursor: "pointer",
      }}
      alignItems="center"
    >
      <Stack direction="row" spacing={1} onClick={() => console.log("Click!")}>
        {icon}
        <Typography color="#1E1E1E" variant="body1" noWrap>
          {iconText}
        </Typography>
      </Stack>
      {expandMore ? (
        <ExpandMoreIcon onClick={() => console.log("Expand more!")} />
      ) : null}
    </Stack>
  );
}
