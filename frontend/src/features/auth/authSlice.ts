import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { api } from "@/lib/api"
import type { AuthUser } from "@/features/auth/types"

interface AuthState {
  user: AuthUser | null
  status: "idle" | "loading" | "authenticated" | "unauthenticated"
}

const initialState: AuthState = {
  user: null,
  status: "idle",
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>(
      "/login",
      credentials
    )
    window.localStorage.setItem("auth_token", data.token)
    return data.user
  }
)

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const { data } = await api.get<{ data: AuthUser }>("/me")
  return data.data
})

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/logout")
  } finally {
    window.localStorage.removeItem("auth_token")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading"
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated"
        state.user = action.payload
      })
      .addCase(login.rejected, (state) => {
        state.status = "unauthenticated"
        state.user = null
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = "authenticated"
        state.user = action.payload
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = "unauthenticated"
        state.user = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "unauthenticated"
        state.user = null
      })
  },
})

export default authSlice.reducer
