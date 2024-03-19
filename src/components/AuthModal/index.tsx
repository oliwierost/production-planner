import { Modal } from "../Modal"
import { useState } from "react"
import { SignIn } from "./SignIn"
import { SignUp } from "./SignUp"

interface SignInProps {
  open: boolean
}

export function AuthModal({ open }: SignInProps) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn")

  const renderForm = () => {
    switch (mode) {
      case "signIn":
        return <SignIn setMode={setMode} />
      case "signUp":
        return <SignUp setMode={setMode} />
      default:
        return null
    }
  }

  return (
    <Modal open={open} blur>
      {renderForm()}
    </Modal>
  )
}
