import * as Yup from "yup"

const taskSchema = {
  title: Yup.string().required("Nazwa jest wymagana"),
  duration: Yup.number()
    .min(1, "Minimalna długość to 1")
    .required("Długość jest wymagana"),
  bgcolor: Yup.string().required("Kolor jest wymagany"),
}

const facilitySchema = {
  title: Yup.string().required("Nazwa jest wymagana"),
  location: Yup.string().required("Lokalizacja jest wymagana"),
  activity: Yup.string().required("Czynność jest wymagana"),
  manpower: Yup.number().min(1, "Minimalna liczba pracowników to 1"),
  bgcolor: Yup.string().required("Kolor jest wymagany"),
}

const deadlineSchema = {
  title: Yup.string().required("Nazwa jest wymagana"),
  date: Yup.date().required("Data jest wymagana"),
}

export const taskModalSchema = Yup.object().shape(taskSchema)
export const facilityModalSchema = Yup.object().shape(facilitySchema)
export const deadlineModalSchema = Yup.object().shape(deadlineSchema)
