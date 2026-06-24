"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PermissionMatrix } from "@/components/roles/permission-matrix";
import { useCreateRole } from "@/lib/hooks/use-roles";
import type { Permission } from "@/lib/types";

export default function CreateRolePage() {
  const router = useRouter();
  const createRole = useCreateRole();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    createRole.mutate(
      { name, description, permissions },
      {
        onSuccess: () => {
          toast.success(`Role "${name}" created successfully`);
          router.push("/dashboard/roles");
        },
        onError: () => toast.error("Failed to create role"),
      }
    );
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Role</h1>
          <p className="text-muted-foreground">Define a new role with custom permissions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role Information</CardTitle>
            <CardDescription>Give your role a name and description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Editor, Manager, Support Agent" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What can users with this role do?" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Permissions</CardTitle>
            <CardDescription>Select the permissions for this role.</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionMatrix value={permissions} onChange={setPermissions} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={createRole.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {createRole.isPending ? "Creating..." : "Create Role"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
