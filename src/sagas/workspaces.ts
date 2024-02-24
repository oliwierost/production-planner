import { deleteDoc, doc, setDoc } from "firebase/firestore"
import { Workspace } from "../slices/workspaces"
import { firestore } from "../../firebase.config"

export const addWorkspaceToFirestore = async (workspace: Workspace) => {
  await setDoc(doc(firestore, `workspaces/${workspace.id}`), workspace)
}

export const deleteWorkspaceFromFirestore = async (workspaceId: string) => {
  await deleteDoc(doc(firestore, `workspaces/${workspaceId}`))
}
