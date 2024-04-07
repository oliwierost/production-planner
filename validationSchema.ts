import * as Yup from "yup"

const signUpSchema = {
  email: Yup.string()
    .email("Niepoprawny adres email")
    .required("Email jest wymagany"),
  password: Yup.string()
    .required("Hasło jest wymagane")
    .min(6, "Hasło musi mieć co najmniej 6 znaków")
    .max(15, "Hasło musi mieć co najwyżej 15 znaków")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      "Hasło musi zawierać co najmniej jedną literę i jedną cyfrę",
    ),
  confirmPassword: Yup.string()
    .required("Potwierdzenie hasła jest wymagane")
    .oneOf([Yup.ref("password"), ""], "Hasła muszą być takie same"),
}

const signInSchema = {
  email: Yup.string()
    .email("Niepoprawny adres email")
    .required("Email jest wymagany"),
  password: Yup.string().required("Hasło jest wymagane"),
}

const taskSchema = {
  title: Yup.string().required("Nazwa jest wymagana"),
  duration: Yup.number()
    .min(1, "Minimalna długość to 1")
    .required("Długość jest wymagana"),
  bgcolor: Yup.string().required("Kolor jest wymagany"),
}

const facilitySchema = {
  title: Yup.string().required("Nazwa jest wymagana"),
  manpower: Yup.number().min(1, "Minimalna liczba pracowników to 1"),
  bgcolor: Yup.string().required("Kolor jest wymagany"),
}

const deadlineSchema = {
  title: Yup.string().required("Nazwa jest wymagana"),
  date: Yup.number().required("Data jest wymagana"),
}

const workspaceSchema = {
  title: Yup.string().required("Nazwa jest wymagana"),
}

const taskModalSchema = Yup.object().shape(taskSchema)
const facilityModalSchema = Yup.object().shape(facilitySchema)
const deadlineModalSchema = Yup.object().shape(deadlineSchema)
const workspaceModalSchema = Yup.object().shape(workspaceSchema)
const signUpModalSchema = Yup.object().shape(signUpSchema)
const signInModalSchema = Yup.object().shape(signInSchema)

export {
  taskModalSchema,
  facilityModalSchema,
  deadlineModalSchema,
  workspaceModalSchema,
  signUpModalSchema,
  signInModalSchema,
}
