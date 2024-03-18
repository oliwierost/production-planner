import { Box, Stack, Typography } from "@mui/material"
import { SetStateAction } from "react"
import { TextField } from "../TextField"
import { Form, Formik, FormikHelpers } from "formik"
import { DriveFileRenameOutline } from "@mui/icons-material"
import { PrimaryButton } from "../PrimaryButton"
import { useAppDispatch } from "../../hooks"
import { initializeUserStart } from "../../slices/user"
import { collection, doc } from "firebase/firestore"
import { firestore } from "../../../firebase.config"

interface SignInProps {
  setMode: React.Dispatch<SetStateAction<"signIn" | "signUp">>
}

interface FormData {
  email: string
  password: string
  repeatPassword: string
  authKey: string
}

const initialValues = {
  email: "",
  password: "",
  repeatPassword: "",
  authKey: "",
}

export function SignUp({ setMode }: SignInProps) {
  const dispatch = useAppDispatch()

  const handleSubmit = (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"],
  ) => {
    try {
      const userId = doc(collection(firestore, "users")).id
      const user = {
        id: userId,
        email: values.email,
        password: values.password,
        openProjectId: null,
        openWorkspaceId: null,
      }
      dispatch(initializeUserStart(user))
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
                  Utwórz konto
                </Typography>
                <Stack spacing={2}>
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
                  <Stack justifyContent="space-between" spacing={1}>
                    <Typography variant="body1" alignSelf="end">
                      Powtórz hasło
                    </Typography>
                    <TextField
                      placeholder="Powtórz hasło"
                      icon={<DriveFileRenameOutline />}
                      value={values.repeatPassword}
                      onChange={(e) => handleInputChange(e, setFieldValue)}
                      name="repeatPassword"
                      type="password"
                    />
                  </Stack>
                  <Stack justifyContent="space-between" spacing={1}>
                    <Typography variant="body1" alignSelf="end">
                      Klucz autoryzacyjny
                    </Typography>
                    <TextField
                      placeholder="Klucz"
                      icon={<DriveFileRenameOutline />}
                      value={values.authKey}
                      onChange={(e) => handleInputChange(e, setFieldValue)}
                      name="authKey"
                      type="text"
                    />
                  </Stack>
                </Stack>
              </Stack>
              <Stack p={2} alignItems="center" spacing={2}>
                <Box width="fit-content">
                  <PrimaryButton
                    type="submit"
                    onClick={() => handleSubmit()}
                    label="Utwórz konto"
                  />
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
