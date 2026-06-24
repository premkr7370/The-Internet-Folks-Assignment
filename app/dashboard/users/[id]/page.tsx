"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/shared/error-state";
import { PERMISSION_GROUPS, RESOURCE_LABELS, ACTION_LABELS } from "@/lib/data/permissions";
import { useUser, useEffectivePermissions, useAssignRole, useRemoveRole } from "@/lib/hooks/use-users";
import { useRoles } from "@/lib/hooks/use-roles";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: user, isLoading: userLoading, isError: userError, refetch: refetchUser } = useUser(id);
  const { data: effective } = useEffectivePermissions(id);
  const { data: allRoles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const handleAssignRole = (roleId: string) => {
    assignRole.mutate({ userId: id, roleId }, {
      onSuccess: () => toast.success("Role assigned"),
      onError: () => toast.error("Failed to assign role"),
    });
  };

  const handleRemoveRole = (roleId: string) => {
    removeRole.mutate({ userId: id, roleId }, {
      onSuccess: () => toast.success("Role removed"),
      onError: () => toast.error("Failed to remove role"),
    });
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (userError || !user) {
    return <ErrorState title="User not found" description="This user doesn't exist." onRetry={() => refetchUser()} />;
  }

  const unassignedRoles = (allRoles || []).filter((r) => !user.roleIds.includes(r.id));

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">View and manage user roles and permissions.</p>
        </div>
      </div>

      {/* Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary/10 text-primary">{user.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Badge variant={user.status === "active" ? "success" : "secondary"}>{user.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Assigned Roles</CardTitle>
            <CardDescription>Roles currently assigned to this user.</CardDescription>
          </div>
          {unassignedRoles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Assign Role
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Available Roles</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unassignedRoles.map((role) => (
                  <DropdownMenuCheckboxItem key={role.id} checked={false} onCheckedChange={() => handleAssignRole(role.id)}>
                    {role.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <motion.div key={role.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} className="group">
                <Badge variant="default" className="gap-1.5 pr-1.5 text-sm py-1 px-3">
                  {role.name}
                  <button
                    onClick={() => handleRemoveRole(role.id)}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary-foreground/20 transition-colors cursor-pointer"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
            {user.roles.length === 0 && <p className="text-sm text-muted-foreground">No roles assigned.</p>}
            {user.roles.length > 1 && <Badge variant="info" className="text-xs">UNION resolution</Badge>}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Effective Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Effective Permissions</CardTitle>
          <CardDescription>
            Computed via UNION of all assigned roles. A permission is granted if any role includes it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {effective ? (
            <div className="space-y-4">
              {PERMISSION_GROUPS.map((group) => {
                const grantedActions = effective.permissionsByResource[group.resource] || [];
                return (
                  <div key={group.resource} className="rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30">
                      <span className="font-medium text-sm">{RESOURCE_LABELS[group.resource]}</span>
                      <Badge
                        variant={grantedActions.length === group.actions.length ? "success" : grantedActions.length > 0 ? "info" : "secondary"}
                        className="text-xs"
                      >
                        {grantedActions.length}/{group.actions.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0">
                      {group.actions.map((action) => {
                        const granted = grantedActions.includes(action);
                        return (
                          <div
                            key={`${group.resource}.${action}`}
                            className={`flex items-center gap-2 px-4 py-2 text-sm border-r last:border-r-0 border-b last:border-b-0 ${granted ? "bg-emerald-500/5" : ""}`}
                          >
                            {granted ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <XIcon className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            )}
                            <span className={granted ? "text-foreground" : "text-muted-foreground/60"}>
                              {ACTION_LABELS[action] || action}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No permissions data available.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
