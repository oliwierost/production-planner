import * as Yup from "yup"

export const validationSchema = {
  title: Yup.string().required("Nazwa jest wymagana"),
  duration: Yup.number()
    .min(1, "Minimalna długość to 1")
    .required("Długość jest wymagana"),
  bgcolor: Yup.string().required("Kolor jest wymagany"),
  date: Yup.date().required("Data jest wymagana"),
  location: Yup.string().required("Lokalizacja jest wymagana"),
  activity: Yup.string().required("Czynność jest wymagana"),
  manpower: Yup.number()
    .min(1, "Minimalna liczba pracowników to 1")
    .required("Liczba pracowników jest wymagana"),
}

export const modalsSchema = Yup.object().shape(validationSchema)
