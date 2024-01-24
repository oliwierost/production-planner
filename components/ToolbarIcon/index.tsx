import { Stack, Typography } from "@mui/material";
import React from "react";

interface toolbarIconProps {
  icon: React.ReactNode;
  iconText: string;
}

export function ToolbarIcon({ icon, iconText }: toolbarIconProps) {
  return (
    <Stack>
      {icon}
      <Typography>{iconText}</Typography>
    </Stack>
  );
}
