import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { SelectChangeEvent, Stack } from "@mui/material"
import { Select, MenuItem } from "@mui/material"
import { useState } from "react"

interface TextFieldProps {
  variant?: "toolbar" | "form"
  placeholder: string
  options: { value: string; label: string }[]
  name?: string
  value?: string
  setFieldValue?: (name: string, value: string) => void
  onChange?: (event: SelectChangeEvent<string>) => void
  width?: number | string
}

export function Dropdown({
  variant = "form",
  placeholder,
  value,
  setFieldValue,
  name,
  options,
  onChange,
  width = 339,
}: TextFieldProps) {
  const [open, setOpen] = useState(false)

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (setFieldValue && name) {
      setFieldValue(name, event.target.value as string)
    } else if (onChange) {
      onChange(event)
    }
  }

  return (
    <Stack height={45} width="fit-content" direction="row">
      <Select
        defaultValue={""}
        value={value}
        onChange={(e) => handleChange(e)}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        fullWidth
        displayEmpty
        renderValue={(val: string) => {
          return !val ? (
            <div style={{ color: "#a1a1a1" }}>{placeholder}</div>
          ) : (
            <>{options.find((option) => option.value === val)?.label}</>
          )
        }}
        sx={{
          all: "unset",
          borderLeft: "1px solid black",
          borderRight: "1px solid black",
          borderTop: variant == "form" ? "1px solid black" : "none",
          borderBottom: variant == "form" ? "1px solid black" : "none",
          width: width,
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
          borderRight: variant == "form" ? "1px solid black" : "none",
          borderTop: variant == "form" ? "1px solid black" : "none",
          borderBottom: variant == "form" ? "1px solid black" : "none",
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
