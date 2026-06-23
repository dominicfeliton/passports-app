import { useEffect, useRef } from 'react'

interface PollingOptions {
  intervalMs: number
  onPoll: () => void
  enabled?: boolean
}

export function usePolling({ intervalMs, onPoll, enabled = true }: PollingOptions) {
  const savedCallback = useRef(onPoll)
  savedCallback.current = onPoll

  useEffect(() => {
    if (!enabled) return

    savedCallback.current()

    const id = setInterval(() => savedCallback.current(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled])
}
