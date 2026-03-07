"use client"

import { useMemo } from "react"
import { IndianRupee, Wallet, TrendingUp, TrendingDown, Activity, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  description?: string
}

function StatCard({ title, value, icon, trend, description }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <div className="mt-1 flex items-center gap-1 text-sm">
            {trend.positive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={trend.positive ? "text-green-500" : "text-red-500"}>
              {trend.value}
            </span>
          </div>
        )}
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardCards() {
  const { transactions, budget } = useStore()

  const stats = useMemo(() => {
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0)
    const remainingBudget = budget - totalSpending

    // Calculate health score
    const budgetRatio = totalSpending / budget
    let healthScore = 100
    if (budgetRatio > 1) healthScore = 20
    else if (budgetRatio > 0.9) healthScore = 40
    else if (budgetRatio > 0.7) healthScore = 60
    else if (budgetRatio > 0.5) healthScore = 80

    // Calculate daily average
    const uniqueDates = new Set(transactions.map((t) => t.date))
    const daysWithSpending = uniqueDates.size || 1
    const dailyAvg = totalSpending / daysWithSpending

    // Determine trend based on recent spending
    const today = new Date().toISOString().split("T")[0]
    const todaySpending = transactions
      .filter((t) => t.date === today)
      .reduce((sum, t) => sum + t.amount, 0)
    const avgDaily = totalSpending / Math.max(daysWithSpending, 1)
    const trendPositive = todaySpending <= avgDaily

    return {
      totalSpending,
      remainingBudget,
      healthScore,
      dailyAvg,
      trendPositive,
    }
  }, [transactions, budget])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Spending This Month"
        value={`₹${stats.totalSpending.toLocaleString("en-IN")}`}
        icon={<IndianRupee className="h-4 w-4" />}
        trend={{
          value: stats.trendPositive ? "On track" : "Higher than usual",
          positive: stats.trendPositive,
        }}
      />
      <StatCard
        title="Remaining Budget"
        value={`₹${stats.remainingBudget.toLocaleString("en-IN")}`}
        icon={<Wallet className="h-4 w-4" />}
        description={`of ₹${budget.toLocaleString("en-IN")} budget`}
      />
      <StatCard
        title="Financial Health Score"
        value={`${stats.healthScore}/100`}
        icon={<Activity className="h-4 w-4" />}
        trend={{
          value: stats.healthScore >= 70 ? "Healthy" : stats.healthScore >= 40 ? "Moderate" : "At risk",
          positive: stats.healthScore >= 70,
        }}
      />
      <StatCard
        title="Average Daily Spending"
        value={`₹${Math.round(stats.dailyAvg).toLocaleString("en-IN")}`}
        icon={<CalendarDays className="h-4 w-4" />}
        description="Based on your activity"
      />
    </div>
  )
}
