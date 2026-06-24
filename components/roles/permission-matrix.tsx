"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, XSquare } from "lucide-react";
import { PERMISSION_GROUPS, RESOURCE_LABELS, ACTION_LABELS } from "@/lib/data/permissions";
import type { Permission } from "@/lib/types";

interface PermissionMatrixProps {
  value: Permission[];
  onChange: (permissions: Permission[]) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({ value, onChange, readOnly = false }: PermissionMatrixProps) {
  const allPermissions = PERMISSION_GROUPS.flatMap((g) =>
    g.actions.map((a) => `${g.resource}.${a}` as Permission)
  );

  const isChecked = (permission: Permission) => value.includes(permission);

  const toggle = useCallback(
    (permission: Permission) => {
      if (readOnly) return;
      onChange(
        isChecked(permission)
          ? value.filter((p) => p !== permission)
          : [...value, permission]
      );
    },
    [value, onChange, readOnly]
  );

  const toggleResource = useCallback(
    (resource: string, actions: string[]) => {
      if (readOnly) return;
      const resourcePerms = actions.map((a) => `${resource}.${a}` as Permission);
      const allChecked = resourcePerms.every((p) => value.includes(p));
      if (allChecked) {
        onChange(value.filter((p) => !resourcePerms.includes(p)));
      } else {
        const newPerms = new Set([...value, ...resourcePerms]);
        onChange(Array.from(newPerms));
      }
    },
    [value, onChange, readOnly]
  );

  const selectAll = () => {
    if (readOnly) return;
    onChange([...allPermissions]);
  };

  const clearAll = () => {
    if (readOnly) return;
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      {!readOnly && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="font-mono">
            {value.length} / {allPermissions.length} permissions
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll} className="gap-1.5 text-xs">
              <CheckSquare className="h-3.5 w-3.5" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll} className="gap-1.5 text-xs">
              <XSquare className="h-3.5 w-3.5" />
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Matrix */}
      <div className="rounded-lg border overflow-hidden">
        {PERMISSION_GROUPS.map((group, gi) => {
          const resourcePerms = group.actions.map(
            (a) => `${group.resource}.${a}` as Permission
          );
          const checkedCount = resourcePerms.filter((p) => value.includes(p)).length;
          const allChecked = checkedCount === resourcePerms.length;
          const someChecked = checkedCount > 0 && !allChecked;

          return (
            <motion.div
              key={group.resource}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gi * 0.05 }}
              className="border-b last:border-b-0"
            >
              {/* Resource header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                {!readOnly && (
                  <Checkbox
                    checked={allChecked ? true : someChecked ? "indeterminate" : false}
                    onCheckedChange={() => toggleResource(group.resource, [...group.actions])}
                  />
                )}
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-sm">
                    {RESOURCE_LABELS[group.resource] || group.resource}
                  </span>
                  <Badge variant={allChecked ? "default" : someChecked ? "info" : "secondary"} className="text-[10px] px-1.5 py-0">
                    {checkedCount}/{group.actions.length}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0">
                {group.actions.map((action) => {
                  const perm = `${group.resource}.${action}` as Permission;
                  const checked = isChecked(perm);

                  return (
                    <label
                      key={perm}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors cursor-pointer border-r last:border-r-0 border-b last:border-b-0 ${
                        readOnly ? "cursor-default" : "hover:bg-muted/50"
                      } ${checked ? "bg-primary/5" : ""}`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(perm)}
                        disabled={readOnly}
                      />
                      <span className={checked ? "text-foreground" : "text-muted-foreground"}>
                        {ACTION_LABELS[action] || action}
                      </span>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
