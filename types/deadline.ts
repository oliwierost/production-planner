// Define the Task interface
export interface Deadline {
  id: string
  title: string
  description: string
  timestamp: {
    day: number
    week: number
    month: number
  }
}
