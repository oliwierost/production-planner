import { Box, Stack, Typography } from "@mui/material"
import { SetStateAction } from "react"
import { TextField } from "../TextField"
import { Form, Formik, FormikHelpers } from "formik"
import { DriveFileRenameOutline } from "@mui/icons-material"
import { PrimaryButton } from "../PrimaryButton"
import { useAppDispatch } from "../../hooks"
import { signInStart } from "../../slices/user"

interface SignInProps {
  setMode: React.Dispatch<SetStateAction<"signIn" | "signUp">>
}

interface FormData {
  email: string
  password: string
}

const initialValues = {
  email: "",
  password: "",
}

export function SignIn({ setMode }: SignInProps) {
  const dispatch = useAppDispatch()

  const handleSubmit = (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"],
  ) => {
    try {
      dispatch(signInStart(values))
    } catch (error) {
      resetForm()
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<FormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    setFieldValue(name, value)
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={(values: FormData, { resetForm }) =>
        handleSubmit(values, resetForm)
      }
    >
      {({ values, handleSubmit, setFieldValue }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <Stack alignItems="center" justifyContent="center">
              <Stack p={2} bgcolor="white" width="fit-content" spacing={4}>
                <Typography variant="h6" alignSelf="start">
                  Zaloguj się
                </Typography>
                <Stack spacing={4}>
                  <Stack justifyContent="space-between" spacing={1}>
                    <Typography variant="body1" alignSelf="end">
                      Adres email
                    </Typography>
                    <TextField
                      placeholder="Email"
                      icon={<DriveFileRenameOutline />}
                      value={values.email}
                      onChange={(e) => handleInputChange(e, setFieldValue)}
                      name="email"
                      type="email"
                    />
                  </Stack>
                  <Stack justifyContent="space-between" spacing={1}>
                    <Typography variant="body1" alignSelf="end">
                      Hasło
                    </Typography>
                    <TextField
                      placeholder="Hasło"
                      icon={<DriveFileRenameOutline />}
                      value={values.password}
                      onChange={(e) => handleInputChange(e, setFieldValue)}
                      name="password"
                      type="password"
                    />
                  </Stack>
                </Stack>
              </Stack>
              <Stack p={2} alignItems="center" spacing={2}>
                <Box width="fit-content">
                  <PrimaryButton
                    type="submit"
                    onClick={() => handleSubmit()}
                    label="Zaloguj"
                  />
                </Box>
                <Typography variant="body1">
                  Nie masz konta? Utwórz je{" "}
                  <Typography
                    component="span"
                    sx={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => setMode("signUp")}
                  >
                    tutaj
                  </Typography>
                </Typography>
              </Stack>
            </Stack>
          </Form>
        </>
      )}
    </Formik>
  )
}
