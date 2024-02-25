import type { UUID } from "."

export interface Workspace {
  id: UUID
  title: string
  description: string
  projects: Array<UUID>
  facilities: Array<UUID>
}
