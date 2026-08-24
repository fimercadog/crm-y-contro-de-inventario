export type OpportunityStatus = "abierta" | "ganada" | "perdida"

export interface Opportunity {
  id: number
  customer_id: number
  customer_name?: string
  title: string
  description: string | null
  amount: number
  probability: number
  stage_id: number
  stage_name?: string
  expected_close_date: string | null
  assigned_user_id: number | null
  assigned_user_name?: string | null
  source: string | null
  status: OpportunityStatus
  lost_reason: string | null
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: number
  name: string
  order: number
  is_won: boolean
  is_lost: boolean
  opportunities: Opportunity[]
}
