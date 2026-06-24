"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Equal, ChevronDown, Merge, Check, X as XIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSION_GROUPS, RESOURCE_LABELS, ACTION_LABELS } from "@/lib/data/permissions";
import { useRoles } from "@/lib/hooks/use-roles";
import type { Role, Permission } from "@/lib/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const permItem = {
  hidden: { opacity: 0, scale: 0.8, y: 5 },
  show: { opacity: 1, scale: 1, y: 0 },
};

export default function PermissionInspectorPage() {
  const { data: roles, isLoading, isError, refetch } = useRoles();
  const [roleA, setRoleA] = useState<Role | null>(null);
  const [roleB, setRoleB] = useState<Role | null>(null);
  const [showResult, setShowResult] = useState(false);

  // UNION merge
  const mergedPermissions = useMemo(() => {
    const set = new Set<Permission>();
    if (roleA) roleA.permissions.forEach((p) => set.add(p));
    if (roleB) roleB.permissions.forEach((p) => set.add(p));
    return Array.from(set).sort();
  }, [roleA, roleB]);

  const handleMerge = () => {
    setShowResult(false);
    setTimeout(() => setShowResult(true), 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Permission Inspector</h1>
          <p className="text-muted-foreground">Visualize how UNION-based resolution merges roles.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr,auto,1fr]">
          <Skeleton className="h-64 rounded-xl" />
          <div className="flex items-center justify-center"><Skeleton className="h-10 w-10 rounded-full" /></div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Failed to load roles" onRetry={() => refetch()} />;
  }

  const renderPermissionList = (permissions: Permission[], color: string) => (
    <motion.div className="space-y-2" variants={container} initial="hidden" animate="show">
      {PERMISSION_GROUPS.map((group) => {
        const actions = group.actions.filter((a) =>
          permissions.includes(`${group.resource}.${a}` as Permission)
        );
        if (actions.length === 0) return null;
        return (
          <div key={group.resource}>
            <p className="text-xs font-medium text-muted-foreground mb-1">{RESOURCE_LABELS[group.resource]}</p>
            <div className="flex flex-wrap gap-1">
              {actions.map((action) => (
                <motion.div key={`${group.resource}.${action}`} variants={permItem}>
                  <Badge variant="outline" className={`text-[11px] ${color}`}>
                    {ACTION_LABELS[action] || action}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
      {permissions.length === 0 && <p className="text-sm text-muted-foreground">No permissions</p>}
    </motion.div>
  );

  const renderMergedResult = () => (
    <motion.div className="space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      {PERMISSION_GROUPS.map((group, gi) => {
        const grantedActions = group.actions.filter((a) =>
          mergedPermissions.includes(`${group.resource}.${a}` as Permission)
        );
        return (
          <motion.div
            key={group.resource}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + gi * 0.08 }}
            className="rounded-lg border overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
              <span className="font-medium text-sm">{RESOURCE_LABELS[group.resource]}</span>
              <Badge
                variant={grantedActions.length === group.actions.length ? "success" : grantedActions.length > 0 ? "info" : "secondary"}
                className="text-[10px]"
              >
                {grantedActions.length}/{group.actions.length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
              {group.actions.map((action, ai) => {
                const granted = grantedActions.includes(action);
                const inA = roleA?.permissions.includes(`${group.resource}.${action}` as Permission);
                const inB = roleB?.permissions.includes(`${group.resource}.${action}` as Permission);
                return (
                  <motion.div
                    key={action}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + gi * 0.08 + ai * 0.03 }}
                    className={`flex items-center gap-2 px-3 py-2 text-sm border-r last:border-r-0 border-b last:border-b-0 ${granted ? "bg-emerald-500/5" : ""}`}
                  >
                    {granted ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XIcon className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={`flex-1 ${granted ? "text-foreground" : "text-muted-foreground/60"}`}>
                      {ACTION_LABELS[action] || action}
                    </span>
                    {granted && (
                      <div className="flex gap-0.5">
                        {inA && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" title="From Role A" />}
                        {inB && <div className="h-1.5 w-1.5 rounded-full bg-violet-500" title="From Role B" />}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Permission Inspector</h1>
        <p className="text-muted-foreground">Visualize how UNION-based permission resolution merges multiple roles.</p>
      </div>

      {/* Role selectors */}
      <div className="grid gap-6 lg:grid-cols-[1fr,auto,1fr]">
        {/* Role A */}
        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Role A
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    {roleA?.name || "Select role"}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(roles || []).map((role) => (
                    <DropdownMenuItem key={role.id} onClick={() => { setRoleA(role); setShowResult(false); }}>
                      {role.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {roleA && <CardDescription className="text-xs">{roleA.permissions.length} permissions</CardDescription>}
          </CardHeader>
          <CardContent className="pt-0">
            {roleA && renderPermissionList(roleA.permissions, "border-blue-500/30 text-blue-600 dark:text-blue-400")}
          </CardContent>
        </Card>

        {/* Operator */}
        <div className="flex lg:flex-col items-center justify-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Plus className="h-4 w-4" />
          </div>
          <Button size="sm" onClick={handleMerge} disabled={!roleA || !roleB} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Merge
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Equal className="h-4 w-4" />
          </div>
        </div>

        {/* Role B */}
        <Card className="border-violet-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                Role B
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    {roleB?.name || "Select role"}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(roles || []).map((role) => (
                    <DropdownMenuItem key={role.id} onClick={() => { setRoleB(role); setShowResult(false); }}>
                      {role.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {roleB && <CardDescription className="text-xs">{roleB.permissions.length} permissions</CardDescription>}
          </CardHeader>
          <CardContent className="pt-0">
            {roleB && renderPermissionList(roleB.permissions, "border-violet-500/30 text-violet-600 dark:text-violet-400")}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Result */}
      <AnimatePresence>
        {showResult && roleA && roleB && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", bounce: 0.15 }}
          >
            <Card className="border-emerald-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Merged Result (UNION)
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {roleA.name} + {roleB.name} = {mergedPermissions.length} effective permissions
                    </CardDescription>
                  </div>
                  <Badge variant="success">{mergedPermissions.length} total</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> From {roleA.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-500" /> From {roleB.name}
                  </span>
                </div>
              </CardHeader>
              <CardContent>{renderMergedResult()}</CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
