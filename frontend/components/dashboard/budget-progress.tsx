"use client"

import { useMemo } from "react"
import { Target, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"

export function BudgetProgress() {
  const { transactions, budget, setBudget } = useStore()

  const { totalSpending, percentage, status } = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0)
    const pct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0
    
    let statusInfo = {
      label: "Healthy spending",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500",
      icon: CheckCircle2,
    }

    if (pct >= 100) {
      statusInfo = {
        label: "Budget exceeded!",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500",
        icon: AlertTriangle,
      }
    } else if (pct >= 80) {
      statusInfo = {
        label: "Approaching limit",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500",
        icon: AlertCircle,
      }
    } else if (pct >= 50) {
      statusInfo = {
        label: "Moderate spending",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-500",
        icon: AlertCircle,
      }
    }

    return {
      totalSpending: total,
      percentage: pct,
      status: statusInfo,
    }
  }, [transactions, budget])

  const StatusIcon = status.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Budget Progress
        </CardTitle>
        <CardDescription>Track your monthly spending against your budget</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Input */}
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="budget">Monthly Budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              step="500"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className="font-medium">
              ₹{totalSpending.toLocaleString("en-IN")} of ₹{budget.toLocaleString("en-IN")}
            </span>
          </div>
          
          <div className="relative">
            <Progress
              value={percentage}
              className="h-4"
            />
            <div
              className="absolute left-0 top-0 h-4 rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: percentage >= 100
                  ? "linear-gradient(90deg, #ef4444, #dc2626)"
                  : percentage >= 80
                  ? "linear-gradient(90deg, #f97316, #ea580c)"
                  : percentage >= 50
                  ? "linear-gradient(90deg, #eab308, #ca8a04)"
                  : "linear-gradient(90deg, #22c55e, #16a34a)",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
              <span className={`text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Remaining budget</span>
            <span className={`text-xl font-bold ${budget - totalSpending < 0 ? "text-red-600" : "text-foreground"}`}>
              ₹{(budget - totalSpending).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
