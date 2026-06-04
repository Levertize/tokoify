"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return <>{children}</>
}
