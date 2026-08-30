"use client"

import { useCallback, useEffect, useState } from "react"
import { Lock, MoreHorizontal, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleFormDialog } from "@/components/admin/role-form-dialog"
import { deleteRole, listRoles } from "@/features/admin/api"
import type { PermissionInfo, Role } from "@/features/admin/types"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<PermissionInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [editing, setEditing] = useState<Role | null>(null)
  const [creating, setCreating] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Role | null>(null)

  const permissionLabel = (name: string) =>
    permissions.find((p) => p.name === name)?.label ?? name

  const fetchData = useCallback(() => {
    setIsLoading(true)
    listRoles()
      .then(({ data }) => {
        setRoles(data.data)
        setPermissions(data.available_permissions)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleConfirmDelete() {
    if (!deleting) return
    try {
      await deleteRole(deleting.id)
      toast.success(`Rol "${deleting.name}" eliminado`)
      setDeleting(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo eliminar el rol")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Roles</h2>
          <p className="text-sm text-muted-foreground">
            Cada permiso controla el acceso real a un módulo. Los roles base no se pueden
            renombrar ni eliminar, pero sí ajustar sus permisos.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setCreating(true)
            setFormOpen(true)
          }}
        >
          Nuevo rol
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    {role.name}
                    {role.is_system && <Lock className="size-3 text-muted-foreground" />}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {role.users_count} usuario{role.users_count === 1 ? "" : "s"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(role)
                            setCreating(false)
                            setFormOpen(true)
                          }}
                        >
                          Editar permisos
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={role.is_system || role.users_count > 0}
                          onClick={() => setDeleting(role)}
                        >
                          Eliminar
                          {role.is_system
                            ? " (rol base)"
                            : role.users_count > 0
                              ? " (tiene usuarios)"
                              : ""}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {role.description && (
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                )}
              </CardHeader>
              <CardContent>
                {role.name === "super-admin" ? (
                  <p className="text-sm text-muted-foreground">Acceso total, sin restricciones.</p>
                ) : role.permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin permisos.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((p) => (
                      <Badge key={p} variant="outline" className="font-normal">
                        {permissionLabel(p)}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <RoleFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) {
              setEditing(null)
              setCreating(false)
            }
          }}
          role={editing}
          permissions={permissions}
          onSaved={fetchData}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el rol &quot;{deleting?.name}&quot;. Solo es posible si no tiene
              usuarios asignados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
