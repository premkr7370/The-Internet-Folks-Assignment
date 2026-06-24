"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Users, KeyRound, ArrowRight, Sparkles,
  Lock, Eye, Zap, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const features = [
  {
    icon: Shield,
    title: "Custom Roles",
    description: "Create granular roles with fine-grained permission control across all resources.",
  },
  {
    icon: Users,
    title: "Multi-Role Users",
    description: "Assign multiple roles to users with automatic UNION-based permission resolution.",
  },
  {
    icon: KeyRound,
    title: "Permission Inspector",
    description: "Visually inspect and debug how multiple roles merge into effective permissions.",
  },
  {
    icon: Eye,
    title: "Real-time Preview",
    description: "See permission changes reflected instantly as you build and modify roles.",
  },
  {
    icon: Lock,
    title: "Resource-Level Control",
    description: "Manage access across Projects, Tasks, Members, Billing, and Settings.",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description: "Built on Next.js 15 with optimized rendering and instant interactions.",
  },
];

const capabilities = [
  "Create and manage custom roles",
  "Assign multiple roles to any user",
  "UNION-based permission resolution",
  "Visual permission inspector",
  "18 permissions across 5 resources",
  "Dark mode and mobile responsive",
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-6xl">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              W
            </div>
            <span>Workbench</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="container relative mx-auto px-4 py-24 sm:py-32 lg:py-40 max-w-6xl text-center">
          <motion.div {...fadeInUp} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              RBAC Studio for modern teams
            </div>
          </motion.div>

          <motion.h1
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto"
          >
            Build permissions that{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent">
              fit your team
            </span>
          </motion.h1>

          <motion.p
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Create custom roles, assign multiple roles to team members, and
            visually inspect effective permissions — all from one powerful
            dashboard.
          </motion.p>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="gap-2 px-8">
              <Link href="/dashboard">
                Start Building
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            A complete RBAC management suite designed for teams that need
            fine-grained access control.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-24 max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Permissions that make sense
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Stop forcing teams into rigid role structures. Workbench RBAC Studio lets 
                you build custom permission sets that match how your team actually works.
              </p>
              <div className="space-y-3">
                {capabilities.map((cap, i) => (
                  <motion.div
                    key={cap}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span className="text-sm">{cap}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="text-xs font-mono text-muted-foreground mb-3">Permission Resolution (UNION)</div>
              <div className="space-y-3 font-mono text-sm">
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                  <div className="text-blue-600 dark:text-blue-400 font-medium mb-1">Role: Admin</div>
                  <div className="text-muted-foreground text-xs space-y-0.5">
                    <div>projects.view, projects.create, projects.edit</div>
                    <div>tasks.view, tasks.create, tasks.edit</div>
                  </div>
                </div>
                <div className="text-center text-muted-foreground">+</div>
                <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
                  <div className="text-violet-600 dark:text-violet-400 font-medium mb-1">Role: Viewer</div>
                  <div className="text-muted-foreground text-xs space-y-0.5">
                    <div>projects.view, billing.view, settings.view</div>
                  </div>
                </div>
                <div className="text-center text-muted-foreground">=</div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <div className="text-emerald-600 dark:text-emerald-400 font-medium mb-1">Effective Permissions</div>
                  <div className="text-muted-foreground text-xs space-y-0.5">
                    <div>projects.view, projects.create, projects.edit</div>
                    <div>tasks.view, tasks.create, tasks.edit</div>
                    <div>billing.view, settings.view</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to take control?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Set up your workspace roles and permissions in minutes, not hours.
          </p>
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href="/dashboard">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground text-[10px] font-bold">
                W
              </div>
              Workbench RBAC Studio  -by Prem Kumar
            </div>
            <p className="text-xs text-muted-foreground">
              Built with Next.js, TypeScript, Tailwind CSS &amp; shadcn/ui
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
