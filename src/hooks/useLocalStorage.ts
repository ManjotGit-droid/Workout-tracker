import { useState } from 'react'

export function useLocalStorage<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  })

  function setValue(value: T) {
    try {
      setStored(value)
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // quota exceeded — silently ignore
    }
  }

  return [stored, setValue]
}
