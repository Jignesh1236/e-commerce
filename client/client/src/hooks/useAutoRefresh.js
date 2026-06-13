import { useEffect, useRef, useCallback } from 'react'

/**
 * Auto-refreshes data every `interval` ms and also when the tab regains focus.
 * @param {Function} fetchFn - async function to call to refresh data
 * @param {number} interval - polling interval in ms (default 30s)
 */
export default function useAutoRefresh(fetchFn, interval = 30000) {
  const fetchRef = useRef(fetchFn)
  useEffect(() => { fetchRef.current = fetchFn }, [fetchFn])

  useEffect(() => {
    // Poll on interval
    const timer = setInterval(() => fetchRef.current(), interval)

    // Refresh when tab becomes visible again
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchRef.current()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [interval])
}
