import { useState, useEffect } from 'react'

/**
 * localStorage-backed state.
 * - `sanitize(parsed)` must return a cleaned value, or `undefined` if the stored
 *   data is unusable (then `initial` is used). This protects the app from
 *   corrupted or hand-edited storage.
 * - Reads and writes are wrapped in try/catch (quota exceeded, private mode, etc.).
 */
export default function useLocalStorage(key, initial, sanitize = (v) => v) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved === null) return initial
      const clean = sanitize(JSON.parse(saved))
      return clean === undefined ? initial : clean
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or unavailable: keep working in memory instead of crashing.
    }
  }, [key, value])

  return [value, setValue]
}
