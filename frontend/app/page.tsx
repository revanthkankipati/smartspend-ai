"use client"

import { useState } from "react"
import { StoreProvider } from "@/lib/store"
import { Header } from "@/components/dashboard/header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { ConnectSection } from "@/components/dashboard/connect-section"
import { ExpenseForm } from "@/components/dashboard/expense-form"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { SpendingCharts } from "@/components/dashboard/spending-charts"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { HealthScore } from "@/components/dashboard/health-score"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { DashboardAnalyticsPanel } from "@/components/dashboard/dashboard-analytics-panel"
import { InsightsChatAssistant } from "@/components/dashboard/insights-chat-assistant"

export default function DashboardPage() {
  const [view, setView] = useState<'dashboard' | 'transactions' | 'import'>('dashboard');

  return (
    <StoreProvider>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* tab selector */}
          <div className="mb-6 flex gap-4">
            <button
              className={`px-4 py-2 rounded ${view==='dashboard' ? 'bg-primary text-white' : 'bg-muted/20'}`}
              onClick={() => setView('dashboard')}
            >Analytics</button>
            <button
              className={`px-4 py-2 rounded ${view==='transactions' ? 'bg-primary text-white' : 'bg-muted/20'}`}
              onClick={() => setView('transactions')}
            >Transactions</button>
            <button
              className={`px-4 py-2 rounded ${view==='import' ? 'bg-primary text-white' : 'bg-muted/20'}`}
              onClick={() => setView('import')}
            >Import</button>
          </div>

          {view === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Welcome back!
                </h1>
                <p className="text-muted-foreground">
                  Track your spending and build better financial habits
                </p>
              </div>

              {/* Show server-computed analytics */}
              <DashboardAnalyticsPanel />

              {/* Chat-based insights */}
              <InsightsChatAssistant />

              {/* Connect/Import Section */}
              <ConnectSection />
            </div>
          )}

          {view === 'transactions' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">All Transactions</h2>
              <TransactionTable />
            </div>
          )}

          {view === 'import' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Import Statement</h2>
              <ConnectSection />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                SmartSpend AI - Helping students manage their finances
              </p>
              <p className="text-sm text-muted-foreground">
                Built with Next.js & Tailwind CSS
              </p>
            </div>
          </div>
        </footer>
      </div>
    </StoreProvider>
  )
}
