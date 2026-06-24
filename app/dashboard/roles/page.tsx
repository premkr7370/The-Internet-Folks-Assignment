"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Plus, MoreHorizontal, Edit2, Copy, Trash2, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useRoles, useDeleteRole, useDuplicateRole } from "@/lib/hooks/use-roles";
import type { Role } from "@/lib/types";

interface RoleWithCount extends Role {
  userCount: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function RolesPage() {
  const router = useRouter();
  const { data: roles, isLoading, isError, refetch } = useRoles();
  const deleteRole = useDeleteRole();
  const duplicateRole = useDuplicateRole();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<RoleWithCount | null>(null);

  const filteredRoles = (roles || []).filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    deleteRole.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`"${deleteTarget.name}" role deleted`);
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete role"),
    });
  };

  const handleDuplicate = (role: RoleWithCount) => {
    duplicateRole.mutate(role, {
      onSuccess: () => toast.success(`"${role.name}" duplicated`),
      onError: () => toast.error("Failed to duplicate role"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
            <p className="text-muted-foreground">Manage access control roles.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Failed to load roles" onRetry={() => refetch()} />;
  }

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage access control roles and their permissions.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/roles/create">
            <Plus className="h-4 w-4" />
            Create Role
          </Link>
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      {/* Grid */}
      {filteredRoles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No roles found"
          description={search ? "Try a different search term." : "Create your first role to get started."}
          actionLabel={search ? undefined : "Create Role"}
          onAction={search ? undefined : () => router.push("/dashboard/roles/create")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <motion.div key={role.id} variants={item}>
              <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">System</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">{role.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/roles/${role.id}/edit`)}>
                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(role)}>
                        <Copy className="h-4 w-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteTarget(role)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className="text-xs">{role.permissions.length} permissions</Badge>
                    <Badge variant="outline" className="text-xs">{role.userCount} {role.userCount === 1 ? "user" : "users"}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This will remove the role from
              {deleteTarget?.userCount ? ` ${deleteTarget.userCount} user(s)` : " all users"}.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteRole.isPending}>
              {deleteRole.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
