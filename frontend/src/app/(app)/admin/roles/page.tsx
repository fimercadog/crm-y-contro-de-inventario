"use client"

import { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { listRoles } from "@/features/admin/api"
import type { RoleOverview, UserRole } from "@/features/admin/types"

const roleLabels: Record<UserRole, string> = {
  "super-admin": "Super Admin",
  administrador: "Administrador",
  comercial: "Comercial",
  inventario: "Inventario",
  vendedor: "Vendedor",
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleOverview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listRoles()
      .then(({ data }) => setRoles(data.data))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Roles</h2>
        <p className="text-sm text-muted-foreground">
          Los roles son fijos y se aplican en el backend en cada endpoint — esta pantalla es
          informativa, no un editor de permisos. Asigna roles a usuarios desde{" "}
          <span className="font-medium">Administración &gt; Usuarios</span>.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    {roleLabels[role.name]}
                  </CardTitle>
                  <Badge variant="secondary">
                    {role.users_count} usuario{role.users_count === 1 ? "" : "s"}
                  </Badge>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
