"use client"

import { useMemo } from "react"
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore, type Category } from "@/lib/store"

interface Insight {
  id: string
  icon: React.ReactNode
  message: string
  type: "info" | "warning" | "success"
}

export function InsightsPanel() {
  const { transactions, budget } = useStore()

  const insights = useMemo(() => {
    const result: Insight[] = []
    if (transactions.length === 0) {
      result.push({
        id: "no-data",
        icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
        message: "Import transactions or add expenses to see personalized insights.",
        type: "info",
      })
      return result
    }

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0)
    const categoryTotals: Record<Category, number> = {
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Entertainment: 0,
      Subscriptions: 0,
      Other: 0,
    }

    transactions.forEach((t) => {
      categoryTotals[t.category] += t.amount
    })

    // Find highest spending category
    const highestCategory = Object.entries(categoryTotals).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )
    if (highestCategory[1] > 0) {
      const percentage = ((highestCategory[1] / totalSpending) * 100).toFixed(0)
      result.push({
        id: "highest-category",
        icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
        message: `${highestCategory[0]} is your highest spending category at ${percentage}% of total expenses.`,
        type: "info",
      })
    }

    // Budget warning
    const budgetUsage = (totalSpending / budget) * 100
    if (budgetUsage >= 90) {
      result.push({
        id: "budget-critical",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        message: `Warning: You've used ${budgetUsage.toFixed(0)}% of your monthly budget. Consider reducing expenses.`,
        type: "warning",
      })
    } else if (budgetUsage >= 70) {
      result.push({
        id: "budget-warning",
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        message: `You've used ${budgetUsage.toFixed(0)}% of your budget. Monitor your spending closely.`,
        type: "warning",
      })
    } else if (budgetUsage < 50 && transactions.length >= 3) {
      result.push({
        id: "budget-healthy",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        message: `Great job! You're well within your budget at ${budgetUsage.toFixed(0)}% spent.`,
        type: "success",
      })
    }

    // Entertainment spending insight
    if (categoryTotals.Entertainment > budget * 0.2) {
      result.push({
        id: "entertainment-high",
        icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
        message: "Entertainment spending is over 20% of your budget. Consider cutting back on leisure activities.",
        type: "warning",
      })
    }

    // Food spending insight
    if (categoryTotals.Food > budget * 0.3) {
      result.push({
        id: "food-high",
        icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
        message: "Food expenses exceed 30% of your budget. Try cooking at home more often.",
        type: "info",
      })
    }

    // Subscription check
    if (categoryTotals.Subscriptions > 0) {
      result.push({
        id: "subscriptions",
        icon: <Lightbulb className="h-5 w-5 text-cyan-500" />,
        message: `You're spending ₹${categoryTotals.Subscriptions.toLocaleString("en-IN")} on subscriptions. Review if all are necessary.`,
        type: "info",
      })
    }

    // Average transaction size
    const avgTransaction = totalSpending / transactions.length
    if (avgTransaction > 500) {
      result.push({
        id: "avg-high",
        icon: <TrendingDown className="h-5 w-5 text-blue-500" />,
        message: `Your average transaction is ₹${avgTransaction.toFixed(0)}. Breaking down large purchases can help track better.`,
        type: "info",
      })
    }

    return result.slice(0, 4) // Limit to 4 insights
  }, [transactions, budget])

  const getBgColor = (type: Insight["type"]) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Smart Insights
        </CardTitle>
        <CardDescription>AI-powered suggestions to improve your finances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`flex items-start gap-3 rounded-lg border p-4 ${getBgColor(insight.type)}`}
            >
              <div className="mt-0.5 shrink-0">{insight.icon}</div>
              <p className="text-sm text-foreground">{insight.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
