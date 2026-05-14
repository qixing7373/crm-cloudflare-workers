type IdleTask = () => void | Promise<void>

export function runIdle(task: IdleTask, timeout = 2500) {
  const execute = () => {
    void task()
  }
  const scheduleIdle = (window as Window & { requestIdleCallback?: Window['requestIdleCallback'] })
    .requestIdleCallback

  if (scheduleIdle) {
    scheduleIdle(execute, { timeout })
    return
  }

  setTimeout(execute, Math.min(timeout, 800))
}
