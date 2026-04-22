// app/(protected)/analyze/page.tsx
'use client';

import { TransactionForm } from '@/components/transaction-form';

export default function AnalyzePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analyze Transaction</h1>
        <p className="text-muted-foreground mt-2">Enter transaction details for real-time fraud detection analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionForm />
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Enter customer and transaction details</li>
              <li>System analyzes with ML model</li>
              <li>Get instant risk assessment</li>
              <li>Review recommended action</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-2">Detection Factors</h3>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Transaction amount</li>
              <li>Geographic distance</li>
              <li>Merchant category</li>
              <li>Time patterns</li>
              <li>Customer profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
