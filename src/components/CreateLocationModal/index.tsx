import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import { Stack, Typography } from "@mui/material"
import { collection, doc, getDoc, setDoc } from "firebase/firestore"
import { Form, Formik, FormikHelpers } from "formik"
import { firestore } from "../../../firebase.config"
import { Modal } from "../Modal"
import { PrimaryButton } from "../PrimaryButton"
import { SecondaryButton } from "../SecondaryButton"
import { TextArea } from "../TextArea"
import { TextField } from "../TextField"

interface CreateLocationModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<string | null>>
}

interface FormData {
  name: string
  description: string
}

const initialValues = {
  name: "",
  description: "",
}

export function CreateLocationModal({
  open,
  setOpen,
}: CreateLocationModalProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<FormData>["setFieldValue"],
  ) => {
    const { name, value } = e.target
    setFieldValue(name, value)
  }

  const handleSubmit = async (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"],
  ) => {
    try {
      const projectId = "PgwbCyMAeN300VU1LcsY"
      const locationsRef = collection(
        firestore,
        "projects",
        projectId,
        "locations",
      )
      const locationRef = doc(locationsRef)
      const locationId = locationRef.id
      const locationSnap = await getDoc(locationRef)
      if (!locationSnap.exists()) {
        await setDoc(locationRef, {
          ...values,
          id: locationId,
        })
      }

      setOpen(null)
      resetForm()
    } catch (error) {
      resetForm()
    }
  }

  const handleClose = (resetForm: FormikHelpers<FormData>["resetForm"]) => {
    setOpen(null)
    resetForm()
  }
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values: FormData, { resetForm }) =>
        handleSubmit(values, resetForm)
      }
    >
      {({ values, handleSubmit, setFieldValue, resetForm }) => (
        <>
          <Form onSubmit={handleSubmit}>
            <Modal open={open} onClose={() => handleClose(resetForm)}>
              <Stack alignItems="center" justifyContent="center">
                <Stack p={2} bgcolor="white" width="fit-content" spacing={4}>
                  <Typography variant="h6">Dodaj lokalizacje</Typography>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Nazwa</Typography>
                      <TextField
                        placeholder="Nazwa"
                        icon={<DriveFileRenameOutlineIcon />}
                        value={values.name}
                        onChange={(e) => handleInputChange(e, setFieldValue)}
                        name="name"
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                    >
                      <Typography variant="body1">Opis*</Typography>
                      <TextArea
                        placeholder="Opis"
                        value={values.description}
                        onChange={(e) => handleInputChange(e, setFieldValue)}
                        name="description"
                      />
                    </Stack>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={5}
                  >
                    <SecondaryButton
                      onClick={() => handleClose(resetForm)}
                      label="Anuluj"
                    />
                    <PrimaryButton
                      type="submit"
                      onClick={() => handleSubmit()}
                      label="Zapisz"
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Modal>
          </Form>
        </>
      )}
    </Formik>
  )
}
