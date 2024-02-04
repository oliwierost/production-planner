import { Stack, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const colors = [
  {
    bgcolor: "#708FF",
    color: "#FFFFFF",
  },
  {
    bgcolor: "#FFC0CB",
    color: "#000000",
  },
  {
    bgcolor: "#FFD700",
    color: "#000000",
  },
  {
    bgcolor: "#FF4500",
    color: "#000000",
  },
  {
    bgcolor: "#FF6347",
    color: "#000000",
  },
];

interface ColorFieldProps {
  value?: string;
  name: string;
  setFieldValue: (name: string, value: string) => void;
}

export function ColorField({ value, setFieldValue, name }: ColorFieldProps) {
  return (
    <Stack direction="row" justifyContent="space-between" width={400}>
      {colors.map((color, index) => (
        <Box
          onClick={() => setFieldValue(name, color.bgcolor)}
          key={index}
          bgcolor={color.bgcolor}
          color={color.color}
          width={45}
          height={45}
          borderRadius={1}
          justifyContent="center"
          alignItems="center"
          sx={{
            cursor: "pointer",
            boxSizing: "border-box",
            border:
              value === color.bgcolor
                ? "2px solid #1D1D1D"
                : "1px solid #1D1D1D",
          }}
        />
      ))}
      <Stack
        width={45}
        height={45}
        borderRadius={1}
        sx={{
          cursor: "pointer",
          boxSizing: "border-box",
          border: "3px dashed #D9D9D9",
        }}
        alignItems="center"
        justifyContent="center"
      >
        <AddIcon fontSize="large" sx={{ color: "#D9D9D9" }} />
      </Stack>
    </Stack>
  );
}
