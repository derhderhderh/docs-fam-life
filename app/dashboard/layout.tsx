"use client"

import React from "react"
import { useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  AlertTriangle,
  Settings,
  LogOut,
  Loader2,
  Menu,
  X,
  CreditCard,
  Clock,
  Lock,
  AlertCircle,
} from "lucide-react"
import { useState } from "react"
import { db, collection, query, where, getDocs } from "@/lib/firebase"
import type { Subscription } from "@/lib/types"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Family Members", href: "/dashboard/family", icon: Users },
  { name: "Trusted Contacts", href: "/dashboard/contacts", icon: UserCheck },
  { name: "Emergency", href: "/dashboard/emergency", icon: AlertTriangle },
]

const secondaryNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, family, isLoading, isAuthenticated, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  // Calculate trial/subscription status
  const accountStatus = useMemo(() => {
    if (!family) return null
    
    const now = new Date()
    
    // Check if account is locked
    if (family.accountStatus === "locked" || family.accountStatus === "deleted") {
      const deletionDate = family.scheduledDeletionAt
      const daysUntilDeletion = deletionDate 
        ? Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 30
      return {
        status: "locked" as const,
        daysUntilDeletion,
        deletionDate,
      }
    }
    
    // Check if has active subscription
    if (subscription && (subscription.status === "active" || subscription.status === "trialing")) {
      return { status: "subscribed" as const }
    }
    
    // Check trial status
    if (family.accountStatus === "trial" && family.trialEndsAt) {
      const trialEnd = new Date(family.trialEndsAt)
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysRemaining <= 0) {
        return { status: "trial_expired" as const }
      }
      
      return {
        status: "trial" as const,
        daysRemaining,
        trialEndsAt: trialEnd,
      }
    }
    
    // No subscription or trial
    if (!subscription && family.accountStatus !== "trial") {
      return { status: "no_subscription" as const }
    }
    
    return null
  }, [family, subscription])

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!db || !family?.id) {
        setSubscriptionLoading(false)
        return
      }

      try {
        const subQuery = query(
          collection(db, "subscriptions"),
          where("familyId", "==", family.id)
        )
        const snapshot = await getDocs(subQuery)
        
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          setSubscription({
            id: snapshot.docs[0].id,
            ...data,
            currentPeriodStart: data.currentPeriodStart?.toDate?.() || new Date(data.currentPeriodStart),
            currentPeriodEnd: data.currentPeriodEnd?.toDate?.() || new Date(data.currentPeriodEnd),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          } as Subscription)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch subscription:", error)
      } finally {
        setSubscriptionLoading(false)
      }
    }

    if (family?.id) {
      fetchSubscription()
    }
  }, [family?.id])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin")
    } else if (!isLoading && user && !user.hasCompletedOnboarding) {
      router.push("/onboarding")
    }
  }, [isLoading, isAuthenticated, user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const userInitials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-4 lg:h-16">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="LifeDocs Family"
              width={180}
              height={45}
              className="h-10 w-auto lg:h-8"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-2 hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Family info */}
        <div className="border-b border-sidebar-border px-4 py-3">
          <p className="text-sm font-medium">{family?.name || "Family Vault"}</p>
          <p className="text-xs text-sidebar-foreground/60">
            {user.role === "family_manager"
              ? "Family Manager"
              : user.role === "parent"
                ? "Parent"
                : "Family Member"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors lg:py-2 lg:text-sm",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Secondary navigation */}
        <div className="border-t border-sidebar-border px-2 py-4">
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors lg:py-2 lg:text-sm",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* User menu */}
        <div className="border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{user.displayName}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {user.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-3 lg:h-16 lg:gap-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 hover:bg-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* Mobile logo in header */}
          <Link href="/dashboard" className="lg:hidden">
            <Image
              src="/images/logo.png"
              alt="LifeDocs Family"
              width={120}
              height={30}
              className="h-7 w-auto"
            />
          </Link>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
            <Link href="/dashboard/documents/new">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Document</span>
            </Link>
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-3 pb-20 lg:p-6 lg:pb-6">
          {/* Trial banner */}
          {accountStatus?.status === "trial" && accountStatus.daysRemaining <= 3 && (
            <Alert variant="default" className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">
                Trial ending soon
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Your free trial ends in {accountStatus.daysRemaining} day{accountStatus.daysRemaining !== 1 ? "s" : ""}.{" "}
                <Link href="/dashboard/billing" className="font-medium underline">
                  Subscribe now
                </Link>{" "}
                to keep access to your family vault.
              </AlertDescription>
            </Alert>
          )}

          {/* Trial badge for active trial */}
          {accountStatus?.status === "trial" && accountStatus.daysRemaining > 3 && (
            <Alert variant="default" className="mb-4 border-primary/50 bg-primary/5">
              <Clock className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">
                Free Trial Active
              </AlertTitle>
              <AlertDescription className="text-muted-foreground">
                You have {accountStatus.daysRemaining} days remaining in your trial.{" "}
                <Link href="/dashboard/billing" className="font-medium text-primary underline">
                  View plans
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Account locked - show blocking UI (except on billing page) */}
          {(accountStatus?.status === "locked" || accountStatus?.status === "trial_expired" || accountStatus?.status === "no_subscription") && pathname !== "/dashboard/billing" ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                  <Lock className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-foreground">Account Locked</h1>
                <p className="mb-6 text-muted-foreground">
                  {accountStatus.status === "trial_expired" 
                    ? "Your free trial has ended. Subscribe to continue accessing your family vault."
                    : accountStatus.status === "locked"
                    ? "Your account has been locked due to an expired subscription."
                    : "You need an active subscription to access your family vault."}
                </p>
                
                {accountStatus.status === "locked" && accountStatus.daysUntilDeletion !== undefined && (
                  <Alert variant="destructive" className="mb-6 text-left">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Data Deletion Warning</AlertTitle>
                    <AlertDescription>
                      Your family data will be <strong>permanently deleted</strong> in{" "}
                      <strong>{accountStatus.daysUntilDeletion} day{accountStatus.daysUntilDeletion !== 1 ? "s" : ""}</strong>{" "}
                      if you do not subscribe.
                      {accountStatus.deletionDate && (
                        <span className="block mt-1 text-xs">
                          Deletion date: {accountStatus.deletionDate.toLocaleDateString()}
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/dashboard/billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Plans start at just $7.99/month
                  </p>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}
