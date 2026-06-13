import { createContext } from 'react'

export const ToastContext = createContext(
  /** @type {{ success: (msg: string) => void, error: (msg: string) => void } | null} */ (null),
)
