import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ToolbarIcon } from "./ToolbarIcon";
import { Stack } from "@mui/material";

export function index() {
  return (
    <Stack>
      <ToolbarIcon icon={<SearchIcon />} iconText="Test" />
    </Stack>
  );
}
