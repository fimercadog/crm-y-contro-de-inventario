"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchMe } from "@/features/auth/authSlice"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (status !== "idle") return

    const token = window.localStorage.getItem("auth_token")
    if (!token) {
      router.replace("/login")
      return
    }

    dispatch(fetchMe())
  }, [status, dispatch, router])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (status !== "authenticated") {
    return null
  }

  return <>{children}</>
}
