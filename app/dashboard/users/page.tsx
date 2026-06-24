"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Users as UsersIcon, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useUsers, useAssignRole, useRemoveRole } from "@/lib/hooks/use-users";
import { useRoles } from "@/lib/hooks/use-roles";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const avatarColors = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
];

export default function UsersPage() {
  const { data: users, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useUsers();
  const { data: allRoles, isLoading: rolesLoading } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  const isLoading = usersLoading || rolesLoading;

  const handleAssignRole = (userId: string, roleId: string) => {
    assignRole.mutate({ userId, roleId }, {
      onSuccess: () => toast.success("Role assigned"),
      onError: () => toast.error("Failed to assign role"),
    });
  };

  const handleRemoveRole = (userId: string, roleId: string) => {
    removeRole.mutate({ userId, roleId }, {
      onSuccess: () => toast.success("Role removed"),
      onError: () => toast.error("Failed to remove role"),
    });
  };

  const filteredUsers = (users || []).filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter.length === 0 || u.roles.some((r) => roleFilter.includes(r.id));
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user roles and permissions.</p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (usersError) {
    return <ErrorState title="Failed to load users" onRetry={() => refetchUsers()} />;
  }

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage user roles and view effective permissions.</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter by Role
              {roleFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">{roleFilter.length}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Roles</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(allRoles || []).map((role) => (
              <DropdownMenuCheckboxItem
                key={role.id}
                checked={roleFilter.includes(role.id)}
                onCheckedChange={(checked) =>
                  setRoleFilter(checked ? [...roleFilter, role.id] : roleFilter.filter((r) => r !== role.id))
                }
              >
                {role.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* User list */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description={search || roleFilter.length > 0 ? "Try adjusting your filters." : "No users in the system."}
        />
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user, i) => (
            <motion.div key={user.id} variants={item}>
              <Link href={`/dashboard/users/${user.id}`}>
                <div className="flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm cursor-pointer group">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={avatarColors[i % avatarColors.length]}>{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {user.roles.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-xs">{role.name}</Badge>
                    ))}
                    {user.roles.length > 1 && <Badge variant="info" className="text-[10px]">UNION</Badge>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        Manage
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Assign Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(allRoles || [])
                        .filter((r) => !user.roles.some((ur) => ur.id === r.id))
                        .map((role) => (
                          <DropdownMenuCheckboxItem key={role.id} checked={false} onCheckedChange={() => handleAssignRole(user.id, role.id)}>
                            {role.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      {user.roles.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Remove Role</DropdownMenuLabel>
                          {user.roles.map((role) => (
                            <DropdownMenuCheckboxItem key={role.id} checked={true} onCheckedChange={() => handleRemoveRole(user.id, role.id)}>
                              {role.name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
