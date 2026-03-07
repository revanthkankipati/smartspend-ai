"use client"

import { useMemo } from "react"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useStore, type Category } from "@/lib/store"

const categoryColors: Record<Category, string> = {
  Food: "#f97316",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Entertainment: "#a855f7",
  Subscriptions: "#06b6d4",
  Other: "#6b7280",
}

export function SpendingCharts() {
  const { transactions } = useStore()

  const categoryData = useMemo(() => {
    const grouped: Record<Category, number> = {
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Entertainment: 0,
      Subscriptions: 0,
      Other: 0,
    }

    transactions.forEach((t) => {
      grouped[t.category] += t.amount
    })

    return Object.entries(grouped)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        fill: categoryColors[name as Category],
      }))
  }, [transactions])

  const weeklyData = useMemo(() => {
    const days: Record<string, number> = {}
    const today = new Date()

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      days[dateStr] = 0
    }

    transactions.forEach((t) => {
      if (days[t.date] !== undefined) {
        days[t.date] += t.amount
      }
    })

    return Object.entries(days).map(([date, amount]) => ({
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      amount,
    }))
  }, [transactions])

  const chartConfig = {
    Food: { label: "Food", color: categoryColors.Food },
    Transport: { label: "Transport", color: categoryColors.Transport },
    Shopping: { label: "Shopping", color: categoryColors.Shopping },
    Entertainment: { label: "Entertainment", color: categoryColors.Entertainment },
    Subscriptions: { label: "Subscriptions", color: categoryColors.Subscriptions },
    Other: { label: "Other", color: categoryColors.Other },
    amount: { label: "Amount", color: "hsl(var(--chart-1))" },
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Pie Chart - Spending by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Distribution of your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No spending data yet
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Weekly Spending */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Spending</CardTitle>
          <CardDescription>Your spending over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                    />
                  }
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
