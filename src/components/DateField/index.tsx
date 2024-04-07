import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import { Stack } from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers"
import { Dayjs } from "dayjs"
import dayjs from "dayjs"
import { useState } from "react"

interface DateFieldProps {
  placeholder: string
  value: number | null
  name?: string
  setFieldValue: (name: string, value: number) => void
  disabled?: boolean
}

export function DateField({
  name,
  setFieldValue,
  value,
  disabled = false,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const handleChange = (date: Dayjs | null) => {
    if (date && name) {
      const actualDate = dayjs(date).startOf("day")
      setFieldValue(name, Number(actualDate))
    }
  }

  return (
    <Stack
      direction="row"
      sx={{
        display: "flex",
        alignItems: "center",
        width: 400,
        border: "1px solid black",
      }}
    >
      <DatePicker
        onChange={handleChange}
        open={open}
        disabled={disabled}
        value={dayjs(value)}
        onClose={() => setOpen(false)}
        sx={{
          //target days header
          "& .MuiPickersCalendar-daysHeader": {
            color: "black",
            bgcolor: "red",
          },
        }}
        slotProps={{
          textField: {
            name: name,
            variant: "standard",
            fullWidth: true,
            InputProps: {
              endAdornment: null,
              disableUnderline: true,
            },
            sx: {
              all: "unset",
              width: 339,
              height: "100%",
              mx: 3,
              flex: 1,
              "&::placeholder": {
                color: "#a1a1a1",
              },
              "& .MuiOutlinedInput-root": {
                height: "100%",
              },
              "& .MuiOutlinedInput-input": {
                height: 45,
                padding: 0,
                lineHeight: "45px",
                ml: 3,
              },
            },
          },
          actionBar: {
            color: "black",
          },
          desktopPaper: {
            sx: {
              backgroundColor: "white",
            },
          },
        }}
      />
      <Stack
        bgcolor="#D9D9D9"
        width={60}
        height={45}
        borderLeft="1px solid black"
        alignItems="center"
        justifyContent="center"
        onClick={() => setOpen(true)}
        sx={{
          cursor: "pointer",
        }}
      >
        <CalendarTodayIcon />
      </Stack>
    </Stack>
  )
}
