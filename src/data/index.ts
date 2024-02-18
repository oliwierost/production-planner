import { DocumentData, collection, getDocs } from "firebase/firestore"
import { firestore } from "../../firebase.config"

export interface Data {
  [key: string]: Array<DocumentData> | undefined
}

export const fetchData = async (
  projectId: string,
  collections: Array<string>,
) => {
  try {
    const basePath = `projects/${projectId}`
    const data = {} as Data
    collections.forEach(async (collectionName) => {
      const collectionRef = collection(
        firestore,
        `${basePath}/${collectionName}`,
      )
      const colData = await getDocs(collectionRef)
      data[collectionName] = colData.docs.map((doc) => doc.data())
    })

    return data
  } catch (error) {
    console.error("Error fetching data", error)
  }
}
