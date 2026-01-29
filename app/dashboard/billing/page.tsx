"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { db, collection, query, where, getDocs } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CreditCard,
  CheckCircle,
  Users,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import type { Subscription } from "@/lib/types"
import { PRICING } from "@/lib/types"
import Checkout from "@/components/checkout"
import { PRODUCTS } from "@/lib/products"

export default function BillingPage() {
  const { user, family } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const isManager = user?.role === "family_manager"

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId)
    setCheckoutOpen(true)
  }

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!db || !family?.id) {
        setIsLoading(false)
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
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [family?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If no subscription exists (free trial or new account)
  const currentPlan = subscription?.plan || "basic"
  const planDetails = PRICING[currentPlan]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment details
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your family{"'"}s subscription details
              </CardDescription>
            </div>
            <Badge
              variant={subscription?.status === "active" ? "default" : "destructive"}
            >
              {subscription?.status || "Trial"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {planDetails.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {planDetails.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                ${planDetails.price}
              </p>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Family Members</p>
                <p className="text-sm text-muted-foreground">
                  {family?.memberCount || 1} / {family?.maxMembers || planDetails.maxMembers}
                </p>
              </div>
            </div>
            {subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Next Billing Date</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.currentPeriodEnd.toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            Everything included in your {planDetails.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              `Up to ${planDetails.maxMembers === 999 ? "unlimited" : planDetails.maxMembers} family members`,
              "Unlimited document storage",
              "Trusted contact management",
              "Emergency access system",
              "Document expiration reminders",
              "Complete audit logging",
              "Email notifications",
              currentPlan === "extended" ? "Priority support" : "Email support",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscribe or Upgrade */}
      {isManager && !subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Start Your Subscription
            </CardTitle>
            <CardDescription>
              Choose a plan to protect your family{"'"}s important documents. All plans include a 7-day free trial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className={`rounded-lg border p-4 ${
                    product.id === "extended-monthly"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    {product.id === "extended-monthly" && (
                      <Badge variant="default" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-foreground">
                      ${(product.priceInCents / 100).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-1 text-xs text-primary font-medium">
                    {product.trialDays}-day free trial
                  </p>
                  <Button
                    onClick={() => handleSubscribe(product.id)}
                    className="mt-4 w-full"
                    variant={product.id === "extended-monthly" ? "default" : "outline"}
                  >
                    Start Free Trial
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage existing subscription */}
      {isManager && subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Upgrade, downgrade, or cancel your subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPlan === "basic" && (
              <div className="rounded-lg border border-primary bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Need more members?</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Upgrade to the Extended Plan for unlimited family members at just
                      $9.99/month.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              {currentPlan === "basic" ? (
                <Button className="flex-1" onClick={() => handleSubscribe("extended-monthly")}>
                  Upgrade to Extended
                </Button>
              ) : (
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => handleSubscribe("basic-monthly")}>
                  Downgrade to Basic
                </Button>
              )}
              <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                <ExternalLink className="h-4 w-4" />
                Manage in Stripe
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Subscription changes take effect immediately. Upgrades are prorated, and
              downgrades take effect at the end of your billing cycle.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              Start your 7-day free trial. You won{"'"}t be charged until the trial ends.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <Checkout productId={selectedPlan} customerEmail={user?.email} />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Method */}
      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Your saved payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription?.stripeCustomerId ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">**** **** **** 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Update
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-border p-8">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 font-medium text-foreground">No payment method</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a payment method to continue your subscription
                </p>
                <Button className="mt-4">Add Payment Method</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Non-manager notice */}
      {!isManager && (
        <Card className="border-muted">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Only the Family Manager can manage billing and subscription settings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
