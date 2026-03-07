"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Lightbulb, Loader2, TrendingUp } from "lucide-react"
import { useStore } from "@/lib/store"

interface DashboardAnalytics {
  totalSpending: number
  remainingBudget: number
  avgDailySpending: number
  healthScore: number
  categoryBreakdown: Record<string, number>
  weeklySpending: Array<{ week: number; amount: number }>
  insights: string[]
}

export function DashboardAnalyticsPanel() {
  const { transactions } = useStore()
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/dashboard")
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const data = await res.json()
        setAnalytics(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Error loading analytics")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [transactions])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-red-500">{error || "No analytics available"}</p>
        </CardContent>
      </Card>
    )
  }

  const scoreColor =
    analytics.healthScore >= 80
      ? "text-green-600"
      : analytics.healthScore >= 60
      ? "text-yellow-600"
      : analytics.healthScore >= 40
      ? "text-orange-600"
      : "text-red-600"

  return (
    <div className="space-y-6">
      {/* Main stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{analytics.totalSpending.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                analytics.remainingBudget < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              ₹{analytics.remainingBudget.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Daily Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{analytics.avgDailySpending.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${scoreColor}`}>
              {analytics.healthScore}/100
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.categoryBreakdown).map(([cat, amount]) => {
              const amt = amount as number
              const pct =
                analytics.totalSpending > 0
                  ? ((amt / analytics.totalSpending) * 100).toFixed(1)
                  : "0"
              return (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Smart Insights
            </CardTitle>
            <CardDescription>
              Based on your current spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
                >
                  <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly trend */}
      {analytics.weeklySpending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.weeklySpending.map((week) => (
                <div key={week.week} className="flex items-center justify-between">
                  <span className="text-sm font-medium">Week {week.week}</span>
                  <span className="font-mono">₹{week.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
