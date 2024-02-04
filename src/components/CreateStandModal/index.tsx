//lokalizacja -> czynnosc -> opis -> siła robocza -> grupa -> kolor
// sila robocza - number field, icon={<DriveFileRenameOutlineIcon />}
//
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Stack, Typography } from "@mui/material";
import { Modal } from "../Modal";
import { TitleBar } from "../TitleBar";
import { TextArea } from "../TextArea";
import { SecondaryButton } from "../SecondaryButton";
import { PrimaryButton } from "../PrimaryButton";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { firestore } from "../../../firebase.config";
import { Form, Formik, FormikHelpers } from "formik";
import { Dropdown } from "../Dropdown";
import { ColorField } from "../ColorField";
import { NumberField } from "../NumberField";

interface CreateStandModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<null>>;
}

interface FormData {
  location: string;
  activity: string;
  description: string;
  manpower: number;
  group?: string;
  color?: string;
}

const initialValues = {
  location: "",
  activity: "",
  description: "",
  manpower: 0,
  group: "",
  color: "",
};

const locations = [
  { value: "lokalizacja 1", label: "Lokalizacja 1" },
  { value: "lokalizacja 2", label: "Lokalizacja 2" },
  { value: "lokalizacja 3", label: "Lokalizacja 3" },
];

const activities = [
  { value: "czynność 1", label: "Czynność 1" },
  { value: "czynność 2", label: "Czynność 2" },
  { value: "czynność 3", label: "Czynność 3" },
];

const groups = [
  { value: "grupa 1", label: "Grupa 1" },
  { value: "grupa 2", label: "Grupa 2" },
  { value: "grupa 3", label: "Grupa 3" },
];

export function CreateStandModal({ open, setOpen }: CreateStandModalProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<FormData>["setFieldValue"]
  ) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
  };

  const handleSubmit = async (
    values: FormData,
    resetForm: FormikHelpers<FormData>["resetForm"]
  ) => {
    try {
      const projectId = "PgwbCyMAeN300VU1LcsY";
      const standsRef = collection(firestore, "projects", projectId, "stands");
      const standRef = doc(standsRef);
      const standId = standRef.id;
      const standSnap = await getDoc(standRef);
      if (!standSnap.exists()) {
        await setDoc(standRef, {
          ...values,
          id: standId,
        });
      }

      setOpen(null);
      resetForm();
      alert("Dodano stanowisko");
    } catch (error) {
      resetForm();
      alert((error as Error).message);
    }
  };

  const handleClose = (resetForm: FormikHelpers<FormData>["resetForm"]) => {
    setOpen(null);
    resetForm();
  };
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
                <TitleBar onClose={() => handleClose(resetForm)} />
                <Stack p={2} bgcolor="white" width="fit-content" spacing={4}>
                  <Typography variant="h6">Dodaj stanowisko</Typography>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Lokalizacja</Typography>
                      <Dropdown
                        options={locations}
                        placeholder="Wybierz lokalizacje"
                        value={values.location}
                        setFieldValue={setFieldValue}
                        name="location"
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1">Czynność</Typography>
                      <Dropdown
                        options={activities}
                        placeholder="Wybierz czynność"
                        value={values.activity}
                        setFieldValue={setFieldValue}
                        name="activity"
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
                    <Stack direction="row" spacing={5} alignItems="center">
                      <Typography variant="body1" width={100}>
                        Siła robocza
                      </Typography>
                      <NumberField
                        placeholder="ilość osób"
                        icon={<DriveFileRenameOutlineIcon />}
                        value={values.manpower}
                        onChange={(e) => handleInputChange(e, setFieldValue)}
                        name="manpower"
                      />
                    </Stack>
                    <Stack direction="row" spacing={5} alignItems="center">
                      <Typography variant="body1" width={100}>
                        Grupa
                      </Typography>
                      <Dropdown
                        options={groups}
                        placeholder="Bez grupy"
                        value={values.group}
                        setFieldValue={setFieldValue}
                        name="group"
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1" width={100}>
                        Kolor
                      </Typography>
                      <ColorField
                        value={values.color}
                        setFieldValue={setFieldValue}
                        name="color"
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
  );
}
