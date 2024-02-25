import type { UUID } from "."

// Define the Facility interface
export interface Facility {
  id: UUID
  index?: number
  title: string
  location: string
  activity: string
  description: string
  bgcolor: string
  tasks: Array<UUID> // Array of task IDs
  manpower: number
}
