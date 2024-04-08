import { useAppSelector } from "../../hooks"
import { selectDeadlines } from "../../selectors/deadlines"
import { Deadline } from "./Deadline"

interface DeadlinesProps {
  time: number
  rowIndex: number | undefined
  lastIndex: number
}

export function Deadlines({ time, rowIndex, lastIndex }: DeadlinesProps) {
  const projectId = useAppSelector((state) => state.user.user?.openProjectId)
  const deadlines = useAppSelector((state) => selectDeadlines(state, projectId))

  return (
    <>
      {deadlines
        ? Object.values(deadlines).map((deadline) => {
            return (
              <Deadline
                key={deadline.id}
                time={time}
                rowIndex={rowIndex}
                lastIndex={lastIndex}
                deadline={deadline}
              />
            )
          })
        : null}
    </>
  )
}
