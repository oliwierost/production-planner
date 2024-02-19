import { InputBase, Stack } from "@mui/material"

interface NumberFieldProps {
  placeholder: string
  name?: string
  icon: React.ReactNode
  value?: number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
}

export function NumberField({
  placeholder,
  icon,
  name,
  value,
  onChange,
  disabled,
}: NumberFieldProps) {
  return (
    <Stack
      direction="row"
      sx={{
        display: "flex",
        alignItems: "center",
        width: 200,
        border: "1px solid black",
      }}
    >
      <InputBase
        name={name}
        value={value! < 1 ? "" : Number(value).toString()}
        onChange={onChange}
        sx={{ mx: 3, flex: 1 }}
        placeholder={placeholder}
        type="number"
        disabled={disabled}
        inputProps={{
          min: 1,
        }}
      />
      <Stack
        bgcolor="#D9D9D9"
        width={60}
        height={45}
        borderLeft="1px solid black"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </Stack>
    </Stack>
  )
}
