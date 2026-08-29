import { api } from "@/lib/api"

export interface DashboardData {
  customers: { total: number; active: number; prospects: number }
  opportunities: {
    open: number
    open_amount: string
    won_this_month: number
    won_amount_this_month: string
  }
  activities: { pending: number; overdue: number }
  inventory: {
    products: number
    low_stock: number
    out_of_stock: number
    stock_value: string
  }
  recent_movements: Array<{
    id: number
    product: string | null
    type: "entrada" | "salida" | "ajuste"
    quantity: number
    new_stock: number
    occurred_at: string
  }>
}

export function getDashboard() {
  return api.get<DashboardData>("/dashboard")
}
