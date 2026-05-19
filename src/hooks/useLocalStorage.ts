import { useState } from 'react'

export const useLocalStorage = <T>(key: string, fallback: T): [T, (v: T) => void] => {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : fallback
    } catch {
      return fallback
    }
  })

  const setValue = (value: T): void => {
    try {
      setStored(value)
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // quota exceeded — silently ignore
    }
  }

  return [stored, setValue]
}
