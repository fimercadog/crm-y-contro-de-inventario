export type MovementType = "entrada" | "salida" | "ajuste"

export interface InventoryMovement {
  id: number
  product_id: number
  product_name?: string
  product_sku?: string
  user_id: number
  user_name?: string
  type: MovementType
  quantity: number
  previous_stock: number
  new_stock: number
  unit_cost: number | null
  reference: string | null
  notes: string | null
  occurred_at: string
  created_at: string
}
