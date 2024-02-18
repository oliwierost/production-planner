import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { Stack } from "@mui/material"
import { Select, MenuItem } from "@mui/material"
import { useState } from "react"

interface TextFieldProps {
  placeholder: string
  options: { value: string; label: string }[]
  name: string
  value?: string
  setFieldValue: (name: string, value: string) => void
}

export function Dropdown({
  placeholder,
  value,
  setFieldValue,
  name,
  options,
}: TextFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <Stack height={45} width="fit-content" direction="row">
      <Select
        value={value}
        onChange={(e) => setFieldValue(name, e.target.value)}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        fullWidth
        displayEmpty
        renderValue={(val: string) => {
          return !val ? (
            <div style={{ color: "#a1a1a1" }}>{placeholder}</div>
          ) : (
            <>{val}</>
          )
        }}
        sx={{
          all: "unset",
          border: "1px solid black",
          width: 339,
          height: "100%",
          "& .MuiOutlinedInput-root": {
            height: "100%",
          },
          ".MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "& .MuiOutlinedInput-input": {
            height: 45,
            padding: 0,
            lineHeight: "45px",
            ml: 3,
          },
        }}
        IconComponent={undefined}
        inputProps={{
          IconComponent: () => null,
          MenuProps: {
            MenuListProps: {
              sx: {
                backgroundColor: "background.default",
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <Stack
        width={60}
        height="100%"
        alignItems="cener"
        justifyContent="center"
        onClick={() => setOpen(!open)}
        sx={{
          cursor: "pointer",
          bgcolor: "#D9D9D9",
          borderRight: "1px solid black",
          borderTop: "1px solid black",
          borderBottom: "1px solid black",
        }}
      >
        <Stack
          width={60}
          height="100%"
          alignItems="cener"
          justifyContent="center"
          sx={{
            bgcolor: "#D9D9D9",
          }}
        >
          <Stack alignItems="cener" justifyContent="center" margin="auto">
            {open ? (
              <KeyboardArrowUpIcon fontSize="large" />
            ) : (
              <KeyboardArrowDownIcon fontSize="large" />
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}
