"use client"

import { useMemo } from "react"
import { Activity, Heart, Shield, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore, type Category } from "@/lib/store"

export function HealthScore() {
  const { transactions, budget } = useStore()

  const { score, message, details } = useMemo(() => {
    if (transactions.length === 0) {
      return {
        score: 100,
        message: "Start tracking to see your score",
        details: [],
      }
    }

    let calculatedScore = 100
    const scoreDetails: { label: string; impact: number; positive: boolean }[] = []

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0)

    // Budget usage impact (40 points max)
    const budgetRatio = totalSpending / budget
    if (budgetRatio > 1) {
      calculatedScore -= 40
      scoreDetails.push({ label: "Over budget", impact: -40, positive: false })
    } else if (budgetRatio > 0.9) {
      calculatedScore -= 30
      scoreDetails.push({ label: "Near budget limit", impact: -30, positive: false })
    } else if (budgetRatio > 0.7) {
      calculatedScore -= 15
      scoreDetails.push({ label: "Moderate spending", impact: -15, positive: false })
    } else if (budgetRatio < 0.5) {
      scoreDetails.push({ label: "Within safe budget zone", impact: 0, positive: true })
    }

    // Category balance impact (30 points max)
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

    const highestCategoryRatio = Math.max(...Object.values(categoryTotals)) / totalSpending
    if (highestCategoryRatio > 0.6) {
      calculatedScore -= 20
      scoreDetails.push({ label: "Spending too concentrated", impact: -20, positive: false })
    } else if (highestCategoryRatio > 0.4) {
      calculatedScore -= 10
      scoreDetails.push({ label: "Could diversify spending", impact: -10, positive: false })
    } else {
      scoreDetails.push({ label: "Good category balance", impact: 0, positive: true })
    }

    // Entertainment/Luxury impact (20 points max)
    const luxurySpending = categoryTotals.Entertainment + categoryTotals.Shopping
    const luxuryRatio = luxurySpending / totalSpending
    if (luxuryRatio > 0.4) {
      calculatedScore -= 20
      scoreDetails.push({ label: "High luxury spending", impact: -20, positive: false })
    } else if (luxuryRatio > 0.25) {
      calculatedScore -= 10
      scoreDetails.push({ label: "Moderate luxury spending", impact: -10, positive: false })
    }

    // Subscriptions check (10 points max)
    if (categoryTotals.Subscriptions > budget * 0.15) {
      calculatedScore -= 10
      scoreDetails.push({ label: "High subscription costs", impact: -10, positive: false })
    }

    calculatedScore = Math.max(0, Math.min(100, calculatedScore))

    let statusMessage = "Excellent financial health!"
    if (calculatedScore < 40) {
      statusMessage = "Financial health at risk"
    } else if (calculatedScore < 60) {
      statusMessage = "Room for improvement"
    } else if (calculatedScore < 80) {
      statusMessage = "Good financial habits"
    }

    return {
      score: calculatedScore,
      message: statusMessage,
      details: scoreDetails,
    }
  }, [transactions, budget])

  const getScoreColor = () => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreRingColor = () => {
    if (score >= 80) return "#22c55e"
    if (score >= 60) return "#eab308"
    if (score >= 40) return "#f97316"
    return "#ef4444"
  }

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Financial Health Score
        </CardTitle>
        <CardDescription>Overall assessment of your spending habits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* Score Circle */}
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/30"
              />
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke={getScoreRingColor()}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className={`h-5 w-5 ${getScoreColor()}`} />
              <span className="font-medium text-foreground">{message}</span>
            </div>
            
            <div className="space-y-2">
              {details.slice(0, 3).map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {detail.positive ? (
                    <Shield className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-muted-foreground">{detail.label}</span>
                  {detail.impact !== 0 && (
                    <span className={detail.impact > 0 ? "text-green-500" : "text-red-500"}>
                      ({detail.impact > 0 ? "+" : ""}{detail.impact})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
