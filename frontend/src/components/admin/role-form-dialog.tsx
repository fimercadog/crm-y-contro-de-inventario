"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createRole, updateRole } from "@/features/admin/api"
import type { PermissionInfo, Role } from "@/features/admin/types"

const groupLabels: Record<string, string> = {
  crm: "CRM",
  inventory: "Inventario",
  reports: "Reportes",
  users: "Usuarios y roles",
  audit: "Auditoría",
  settings: "Configuración",
  ai: "Asistente IA",
}

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  permissions: PermissionInfo[]
  onSaved: () => void
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onSaved,
}: RoleFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(role?.name ?? "")
    setDescription(role?.description ?? "")
    setSelected(new Set(role?.permissions ?? []))
  }, [open, role])

  const groups = useMemo(() => {
    const byGroup = new Map<string, PermissionInfo[]>()
    for (const p of permissions) {
      const key = p.name.split(".")[0]
      byGroup.set(key, [...(byGroup.get(key) ?? []), p])
    }
    return [...byGroup.entries()]
  }, [permissions])

  function toggle(perm: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(perm)) next.delete(perm)
      else next.add(perm)
      return next
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role?.is_system && !name.trim()) {
      toast.error("El nombre del rol es obligatorio")
      return
    }
    setIsSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        permissions: [...selected],
      }
      if (role) {
        await updateRole(role.id, payload)
        toast.success("Rol actualizado")
      } else {
        await createRole(payload)
        toast.success("Rol creado")
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar el rol")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{role ? "Editar rol" : "Nuevo rol"}</DialogTitle>
        </DialogHeader>

        <form id="role-form" onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="role-name">Nombre</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role?.is_system}
            />
            {role?.is_system && (
              <p className="text-xs text-muted-foreground">
                Los roles base no se pueden renombrar, pero sí ajustar sus permisos.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role-desc">Descripción</Label>
            <Textarea
              id="role-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <Label>Permisos</Label>
            {groups.map(([group, perms]) => (
              <div key={group} className="rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium">{groupLabels[group] ?? group}</p>
                <div className="flex flex-col gap-2">
                  {perms.map((p) => (
                    <div key={p.name} className="flex items-start gap-2">
                      <Checkbox
                        id={`perm-${p.name}`}
                        checked={selected.has(p.name)}
                        onCheckedChange={() => toggle(p.name)}
                      />
                      <Label htmlFor={`perm-${p.name}`} className="text-sm font-normal">
                        {p.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="role-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
