import { Modal } from "../Modal"
import { useState } from "react"
import { SignIn } from "./SignIn"
import { SignUp } from "./SignUp"

interface SignInProps {
  open: boolean
}

export function AuthModal({ open }: SignInProps) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn")

  return (
    <Modal open={open} blur>
      {mode === "signIn" ? (
        <SignIn setMode={setMode} />
      ) : (
        <SignUp setMode={setMode} />
      )}
    </Modal>
  )
}
