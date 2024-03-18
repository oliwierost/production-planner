import { InputBase, Stack } from "@mui/material"

interface TextFieldProps {
  placeholder: string
  name?: string
  icon: React.ReactNode
  value?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  type?: string
}

export function TextField({
  placeholder,
  icon,
  onChange,
  value,
  name,
  type = "text",
}: TextFieldProps) {
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
      <InputBase
        type={type}
        sx={{
          mx: 3,
          flex: 1,
          "&::placeholder": {
            color: "#a1a1a1",
          },
        }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
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
