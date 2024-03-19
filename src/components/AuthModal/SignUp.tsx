import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { SetStateAction } from "react"
import { TextField } from "../TextField"
import { Form, Formik, FormikHelpers } from "formik"
import { DriveFileRenameOutline, PriorityHigh } from "@mui/icons-material"
import { PrimaryButton } from "../PrimaryButton"
import { useAppDispatch } from "../../hooks"
import { initializeUserStart } from "../../slices/user"
import { signUpModalSchema } from "../../../validationSchema"

interface SignInProps {
  setMode: React.Dispatch<SetStateAction<"signIn" | "signUp">>
}

interface FormData {
  email: string
  password: string
  confirmPassword: string
}

const initialValues = {
  email: "",
  password: "",
  confirmPassword: "",
}

export function SignUp({ setMode }: SignInProps) {
  const dispatch = useAppDispatch()

  const handleSubmit = (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"],
  ) => {
    try {
      dispatch(
        initializeUserStart({ email: values.email, password: values.password }),
      )
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
      validationSchema={signUpModalSchema}
      onSubmit={(values: FormData, { resetForm }) =>
        handleSubmit(values, resetForm)
      }
    >
      {({ values, handleSubmit, setFieldValue, errors, touched }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <Stack alignItems="center" justifyContent="center">
              <Stack p={2} bgcolor="white" width="fit-content" spacing={4}>
                <Typography variant="h6" alignSelf="start">
                  Utwórz konto
                </Typography>
                <Stack spacing={2}>
                  <Stack justifyContent="space-between" spacing={1}>
                    <Typography variant="body1" alignSelf="end">
                      Adres email
                    </Typography>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        position="relative"
                      >
                        <Box
                          position="absolute"
                          sx={{
                            right: 60,
                            top: 5,
                          }}
                        >
                          {errors.email && touched.email ? (
                            <Tooltip title={errors.email} arrow>
                              <PriorityHigh color="error" fontSize="large" />
                            </Tooltip>
                          ) : null}
                        </Box>
                        <TextField
                          placeholder="email"
                          icon={<DriveFileRenameOutline />}
                          value={values.email}
                          onChange={(e) => handleInputChange(e, setFieldValue)}
                          name="email"
                          type="email"
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack justifyContent="space-between" spacing={1}>
                    <Typography variant="body1" alignSelf="end">
                      Hasło
                    </Typography>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        position="relative"
                      >
                        <Box
                          position="absolute"
                          sx={{
                            right: 60,
                            top: 5,
                          }}
                        >
                          {errors.password && touched.password ? (
                            <Tooltip title={errors.password} arrow>
                              <PriorityHigh color="error" fontSize="large" />
                            </Tooltip>
                          ) : null}
                        </Box>
                        <TextField
                          placeholder="hasło"
                          icon={<DriveFileRenameOutline />}
                          value={values.password}
                          onChange={(e) => handleInputChange(e, setFieldValue)}
                          name="password"
                          type="password"
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack justifyContent="space-between" spacing={1}>
                    <Typography variant="body1" alignSelf="end">
                      Powtórz hasło
                    </Typography>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        position="relative"
                      >
                        <Box
                          position="absolute"
                          sx={{
                            right: 60,
                            top: 5,
                          }}
                        >
                          {errors.confirmPassword && touched.confirmPassword ? (
                            <Tooltip title={errors.confirmPassword} arrow>
                              <PriorityHigh color="error" fontSize="large" />
                            </Tooltip>
                          ) : null}
                        </Box>
                        <TextField
                          placeholder="powtórz hasło"
                          icon={<DriveFileRenameOutline />}
                          value={values.confirmPassword}
                          onChange={(e) => handleInputChange(e, setFieldValue)}
                          name="confirmPassword"
                          type="password"
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              <Stack p={2} alignItems="center" spacing={2}>
                <Box width="fit-content">
                  <PrimaryButton type="submit" label="Utwórz konto" />
                </Box>
                <Typography variant="body1">
                  Masz konto? Zaloguj się{" "}
                  <Typography
                    component="span"
                    sx={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={() => setMode("signIn")}
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
