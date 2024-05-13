import { TrendingDown, TrendingUp } from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material"
import { Raport as RaportType } from "../../slices/raports"

interface RaportProps {
  raport: RaportType
}

export function Raport({ raport }: RaportProps) {
  const progressDiff = Number(raport.progress) - Number(raport.prevProgress)
  return (
    <Accordion
      sx={{
        "& .MuiAccordionSummary-root": {
          bgcolor: "white",
        },
        "& .MuiAccordionDetails-root": {
          bgcolor: "white",
        },
      }}
    >
      <AccordionSummary>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Typography component="span" fontWeight={600} variant="h6">
            {raport.title}
          </Typography>
          <Stack direction="row" spacing={0} alignItems="center">
            <Typography
              color={progressDiff > 0 ? "#4CBB17" : "#C70039"}
              variant="h6"
            >
              {raport.progress}%
            </Typography>
            {progressDiff > 0 ? (
              <TrendingUp
                sx={{ color: "#4CBB17", rotate: "-15deg" }}
                fontSize="small"
              />
            ) : (
              <TrendingDown
                sx={{ color: "#C70039", rotate: "15deg" }}
                fontSize="small"
              />
            )}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack width={300} padding={2} spacing={2}>
          <Typography>
            Komentarz:{" "}
            <Typography component="span" fontWeight={600}>
              {raport.comment}
            </Typography>
          </Typography>
          <Typography>
            Progres:{" "}
            <Typography component="span" fontWeight={600}>
              {raport.progress}%
            </Typography>
          </Typography>
          <Typography>
            Przyrost progresu:{" "}
            <Typography
              component="span"
              fontWeight={600}
              color={progressDiff > 0 ? "#4CBB17" : "#C70039"}
            >
              {progressDiff}%
            </Typography>
          </Typography>
          <Typography>
            Data złożenia:{" "}
            <Typography component="span" fontWeight={600}>
              {new Date(raport.createdAt).toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </Typography>
          </Typography>
          <Typography>
            Złożono przez:{" "}
            <Typography component="span" fontWeight={600}>
              {raport.raportingUserEmail}
            </Typography>
          </Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
