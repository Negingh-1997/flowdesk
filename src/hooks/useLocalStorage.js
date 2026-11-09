import { useState, useEffect } from 'react'

const identity = (v) => v

function backupCorrupt(key, raw) {
  try {
    localStorage.setItem(`${key}:corrupt-backup`, raw.slice(0, 1_000_000))
  } catch {
    // Storage full or unavailable: nothing more we can do.
  }
}

// Returns the cleaned stored value, or undefined when nothing usable is stored.
function load(key, sanitize) {
  let saved = null
  try {
    saved = localStorage.getItem(key)
    if (saved === null) return undefined
    const clean = sanitize(JSON.parse(saved))
    if (clean !== undefined) return clean
  } catch {
    // Unreadable JSON or storage error: fall through to the backup below.
  }
  // Unusable data would be overwritten by the defaults, so keep a copy first.
  if (saved !== null) backupCorrupt(key, saved)
  return undefined
}

/**
 * localStorage-backed state.
 * - `sanitize(parsed)` must return a cleaned value, or `undefined` if the stored
 *   data is unusable (then `initial` is used). `initial` may be a function.
 * - All reads and writes are wrapped in try/catch (quota, private mode, ...).
 * - Changes made in another tab are picked up through the `storage` event,
 *   and go through `sanitize` like any other stored data.
 */
export default function useLocalStorage(key, initial, sanitize = identity) {
  const [value, setValue] = useState(() => {
    const loaded = load(key, sanitize)
    if (loaded !== undefined) return loaded
    return typeof initial === 'function' ? initial() : initial
  })

  useEffect(() => {
    try {
      const next = JSON.stringify(value)
      if (localStorage.getItem(key) !== next) localStorage.setItem(key, next)
    } catch {
      // Storage full or unavailable: keep working in memory instead of crashing.
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (e) => {
      try {
        if (e.storageArea !== localStorage || e.key !== key || e.newValue === null) return
      } catch {
        return
      }
      const loaded = load(key, sanitize)
      if (loaded !== undefined) setValue(loaded)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, sanitize])

  return [value, setValue]
}
