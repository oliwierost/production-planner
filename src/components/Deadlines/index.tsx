import { useAppSelector } from "../../hooks"
import { Deadline } from "./Deadline"

interface DeadlinesProps {
  time: number
  rowIndex: number | undefined
  lastIndex: number
}

export function Deadlines({ time, rowIndex, lastIndex }: DeadlinesProps) {
  const deadlines = useAppSelector((state) => state.deadlines.deadlines)

  return (
    <>
      {Object.values(deadlines).map((deadline) => {
        return (
          <Deadline
            key={deadline.id}
            time={time}
            rowIndex={rowIndex}
            lastIndex={lastIndex}
            deadline={deadline}
          />
        )
      })}
    </>
  )
}
