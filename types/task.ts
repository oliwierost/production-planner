import { UUID } from "../types"

export interface Task {
  id: UUID
  title: string
  description: string
  bgcolor: string
  duration: number
  dropped: boolean
  startDate?: string
  endDate?: string
  prerequisites?: UUID[]  // Task IDs
  facilityId?: string
  startTime?: number
}
