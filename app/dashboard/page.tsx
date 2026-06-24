"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, Shield, KeyRound, Layers, ArrowRight, TrendingUp, Crown,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatsSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useRoles } from "@/lib/hooks/use-roles";
import { useUsers } from "@/lib/hooks/use-users";
import { PERMISSION_GROUPS, RESOURCE_LABELS } from "@/lib/data/permissions";

const CHART_COLORS = [
  "oklch(0.65 0.19 260)",   // blue
  "oklch(0.65 0.19 150)",   // green
  "oklch(0.70 0.17 50)",    // amber
  "oklch(0.65 0.22 310)",   // purple
  "oklch(0.65 0.20 20)",    // rose
];

const avatarColors = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: roles, isLoading: rolesLoading, isError: rolesError, refetch: refetchRoles } = useRoles();
  const { data: users, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useUsers();

  const isLoading = rolesLoading || usersLoading;
  const isError = rolesError || usersError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your RBAC configuration.</p>
        </div>
        <StatsSkeleton />
      </div>
    );
  }

  if (isError || !roles || !users) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        description="Could not fetch roles and users data."
        onRetry={() => { refetchRoles(); refetchUsers(); }}
      />
    );
  }

  const customRoles = roles.filter((r) => !r.isSystem);
  const multiRoleUsers = users.filter((u) => u.roles?.length > 1 || u.roleIds?.length > 1);

  // Permission distribution per resource
  const permDistribution = PERMISSION_GROUPS.map((group, i) => {
    const count = roles.reduce((acc, role) => {
      const resourcePerms = role.permissions.filter((p) => p.startsWith(group.resource + "."));
      return acc + resourcePerms.length;
    }, 0);
    return {
      name: RESOURCE_LABELS[group.resource],
      value: count,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  const stats = [
    { title: "Total Users", value: users.length, sub: "Active team members", icon: Users, trend: true },
    { title: "Total Roles", value: roles.length, sub: `${roles.filter(r => r.userCount > 0).length} in use`, icon: Shield, trend: false },
    { title: "Custom Roles", value: customRoles.length, sub: "User-created", icon: Layers, trend: true },
    { title: "Total Permissions", value: 18, sub: "Across 5 resources", icon: KeyRound, trend: false },
  ];

  // Sort roles by most recently updated
  const recentRoles = [...roles].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your RBAC configuration.</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {stat.trend && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts + Widgets row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Permission distribution chart */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Permission Distribution</CardTitle>
              <CardDescription>Permissions assigned across resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={permDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {permDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {permDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users with Multiple Roles */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Multi-Role Users</CardTitle>
                <CardDescription>Users with UNION-resolved permissions</CardDescription>
              </div>
              <Badge variant="info" className="text-xs">{multiRoleUsers.length}</Badge>
            </CardHeader>
            <CardContent>
              {multiRoleUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No multi-role users yet.</p>
              ) : (
                <div className="space-y-3">
                  {multiRoleUsers.map((user, i) => (
                    <Link key={user.id} href={`/dashboard/users/${user.id}`}>
                      <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-xs ${avatarColors[i % avatarColors.length]}`}>
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {(user.roles || []).map((r: { id: string; name: string }) => (
                              <Badge key={r.id} variant="secondary" className="text-[10px] px-1.5 py-0">{r.name}</Badge>
                            ))}
                          </div>
                        </div>
                        <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recently created/updated roles */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Roles</CardTitle>
                <CardDescription>Latest role configurations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link href="/dashboard/roles">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRoles.map((role) => (
                  <Link key={role.id} href={`/dashboard/roles/${role.id}/edit`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer">
                      <div className="min-w-0">
                        <p className="text-sm font-medium flex items-center gap-2">
                          {role.name}
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">System</Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{role.permissions.length} permissions</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {role.userCount} {role.userCount === 1 ? "user" : "users"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
