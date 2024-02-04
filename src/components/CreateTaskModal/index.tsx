import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Stack, Typography } from "@mui/material";
import { TextField } from "../TextField";
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

interface CreateTaskModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<null>>;
}

interface FormData {
  name: string;
  description: string;
  duration: number;
  required?: string;
  group?: string;
  color?: string;
}

const initialValues = {
  name: "",
  description: "",
  duration: 0,
  required: "",
  group: "",
  color: "",
};

const groups = [
  { value: "grupa 1", label: "Grupa 1" },
  { value: "grupa 2", label: "Grupa 2" },
  { value: "grupa 3", label: "Grupa 3" },
];

const required = [
  { value: "zadanie 1", label: "zadanie 1" },
  { value: "zadanie 2", label: "zadanie 2" },
  { value: "zadanie 3", label: "zadanie 3" },
];

export function CreateTaskModal({ open, setOpen }: CreateTaskModalProps) {
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
      const tasksRef = collection(firestore, "projects", projectId, "tasks");
      const taskRef = doc(tasksRef);
      const taskId = taskRef.id;
      const taskSnap = await getDoc(taskRef);
      if (!taskSnap.exists()) {
        await setDoc(taskRef, {
          ...values,
          id: taskId,
        });
      }

      setOpen(null);
      resetForm();
      alert("Dodano zadanie");
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
                  <Typography variant="h6">Dodaj zadanie</Typography>
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
                    <Stack direction="row" spacing={5} alignItems="center">
                      <Typography variant="body1" width={100}>
                        Czas trwania
                      </Typography>
                      <NumberField
                        placeholder="Czas"
                        icon={<AccessTimeIcon />}
                        value={values.duration}
                        onChange={(e) => handleInputChange(e, setFieldValue)}
                        name="duration"
                      />
                    </Stack>
                    <Stack direction="row" spacing={5} alignItems="center">
                      <Typography variant="body1" width={100}>
                        Wymagane
                      </Typography>
                      <Dropdown
                        options={required}
                        placeholder="Brak wymaganych zadań"
                        value={values.required}
                        setFieldValue={setFieldValue}
                        name="required"
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
