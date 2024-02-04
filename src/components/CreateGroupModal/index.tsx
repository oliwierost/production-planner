import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { Stack, Typography } from "@mui/material";
import { TextField } from "../TextField";
import { Modal } from "../Modal";
import { TitleBar } from "../TitleBar";
import { SecondaryButton } from "../SecondaryButton";
import { PrimaryButton } from "../PrimaryButton";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { firestore } from "../../../firebase.config";
import { Form, Formik, FormikHelpers } from "formik";
import { Dropdown } from "../Dropdown";
import { ColorField } from "../ColorField";

interface CreateGroupModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<null>>;
}

interface FormData {
  name: string;
  group: string;
  place: string;
  color: string;
}

const initialValues = {
  name: "",
  group: "",
  place: "",
  color: "",
};

const stands = [
  { value: "stand 1", label: "stand 1" },
  { value: "stand 2", label: "stand 2" },
  { value: "stand 3", label: "stand 3" },
  { value: "stand 4", label: "stand 4" },
  { value: "stand 5", label: "stand 5" },
];

const tasks = [
  { value: "task 1", label: "task 1" },
  { value: "task 2", label: "task 2" },
  { value: "task 3", label: "task 3" },
  { value: "task 4", label: "task 4" },
  { value: "task 5", label: "task 5" },
];

const group = [
  { value: "Zadania", label: "Zadania" },
  { value: "Stanowiska", label: "Stanowiska" },
];

export function CreateGroupModal({ open, setOpen }: CreateGroupModalProps) {
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
      const groupsRef = collection(firestore, "projects", projectId, "groups");
      const groupRef = doc(groupsRef);
      const groupId = groupRef.id;
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) {
        await setDoc(groupRef, {
          ...values,
          id: groupId,
        });
      }

      setOpen(null);
      resetForm();
      alert("Dodano grupe");
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
                  <Typography variant="h6">Dodaj grupę</Typography>
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
                      alignItems="center"
                      spacing={5}
                    >
                      <Typography variant="body1" width={100}>
                        Grupuj
                      </Typography>
                      <Dropdown
                        options={group}
                        placeholder="Zadania lub stanowiska"
                        value={values.group}
                        setFieldValue={setFieldValue}
                        name="group"
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="flex-start "
                      spacing={5}
                      alignItems="center"
                    >
                      <Typography variant="body1" width={100}>
                        Umieść
                      </Typography>
                      <Dropdown
                        options={values.group === "Zadania" ? tasks : stands}
                        placeholder="Zadania lub stanowiska"
                        value={values.place}
                        setFieldValue={setFieldValue}
                        name="place"
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="flex-start "
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
