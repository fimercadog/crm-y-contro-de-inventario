export type ActivityType =
  | "llamada"
  | "reunion"
  | "email"
  | "whatsapp"
  | "tarea"
  | "seguimiento"
  | "nota"
  | "otro"

export type ActivityStatus = "pendiente" | "completada" | "cancelada"
export type ActivityPriority = "baja" | "media" | "alta"

export interface Activity {
  id: number
  customer_id: number | null
  customer_name?: string | null
  opportunity_id: number | null
  opportunity_title?: string | null
  user_id: number
  user_name?: string
  type: ActivityType
  title: string
  description: string | null
  scheduled_at: string | null
  completed_at: string | null
  status: ActivityStatus
  priority: ActivityPriority
  created_at: string
}
