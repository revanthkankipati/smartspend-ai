"use client"

import { useState } from "react"
import { Link2, Upload, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export function ConnectSection({ onImportSuccess }: { onImportSuccess?: () => void }) {
  const { importSampleTransactions, transactions, refreshTransactions } = useStore()
  const [isImporting, setIsImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [statementText, setStatementText] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)

  const handleSampleImport = async () => {
    setIsImporting(true)
    // Simulate import delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    importSampleTransactions()
    setIsImporting(false)
    setImported(true)
    // Reset imported state after 3 seconds
    setTimeout(() => setImported(false), 3000)
  }

  const handleStatementImport = async () => {
    if (!statementText.trim()) return
    setIsImporting(true)
    setParseError(null)
    try {
      const res = await fetch('/api/statement/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: statementText })
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'parse failed')
      }
      const body = await res.json()
      // refresh local state with inserted transactions
      await refreshTransactions()
      // notify parent to refresh analytics
      onImportSuccess?.()
      setImported(true)
      setStatementText('')
      setTimeout(() => setImported(false), 3000)
    } catch (err: any) {
      console.error(err)
      setParseError(err.message || 'Failed to parse')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card className="border-dashed bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center sm:py-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Link2 className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {transactions.length > 0 ? "Import More Transactions" : "Connect Your Transactions"}
        </h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {transactions.length > 0
            ? "Add more sample transactions to see analytics in action"
            : "Import your UPI transactions or load sample data to get started with tracking"}
        </p>
        <div className="w-full">
          <textarea
            value={statementText}
            onChange={(e) => setStatementText(e.target.value)}
            placeholder="Paste bank/UPI statement here (CSV or plain text)"
            className="w-full rounded border p-2"
            rows={6}
          />
          {parseError && <p className="text-red-500 text-sm mt-1">{parseError}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            onClick={handleStatementImport}
            disabled={isImporting}
            className="min-w-[220px] gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : imported ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Imported Successfully
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Statement
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleSampleImport}
            disabled={isImporting}
            className="min-w-[220px] gap-2"
          >
            <Upload className="h-4 w-4" />
            Add Sample Data
          </Button>
        </div>
        {imported && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400">
            Transactions added!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
