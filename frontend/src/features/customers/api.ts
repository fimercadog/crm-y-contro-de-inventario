import { api } from "@/lib/api"
import type { Customer, Contact, PaginatedResponse } from "@/features/customers/types"

export interface CustomerListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  type?: string
  sort?: string
  direction?: "asc" | "desc"
}

export function listCustomers(params: CustomerListParams) {
  return api.get<PaginatedResponse<Customer>>("/customers", { params })
}

export function getCustomer(id: number) {
  return api.get<{ data: Customer }>(`/customers/${id}`)
}

export type CustomerPayload = Omit<
  Customer,
  "id" | "created_at" | "updated_at" | "assigned_user_name" | "contacts_count" | "contacts"
>

export function createCustomer(payload: Partial<CustomerPayload>) {
  return api.post<{ data: Customer }>("/customers", payload)
}

export function updateCustomer(id: number, payload: Partial<CustomerPayload>) {
  return api.put<{ data: Customer }>(`/customers/${id}`, payload)
}

export function deleteCustomer(id: number) {
  return api.delete(`/customers/${id}`)
}

export function createContact(customerId: number, payload: Partial<Contact>) {
  return api.post<{ data: Contact }>(`/customers/${customerId}/contacts`, payload)
}

export function updateContact(id: number, payload: Partial<Contact>) {
  return api.put<{ data: Contact }>(`/contacts/${id}`, payload)
}

export function deleteContact(id: number) {
  return api.delete(`/contacts/${id}`)
}

export interface ContactListParams {
  page?: number
  per_page?: number
  search?: string
  customer_id?: number
  status?: string
}

export function listContacts(params: ContactListParams) {
  return api.get<PaginatedResponse<Contact>>("/contacts", { params })
}
