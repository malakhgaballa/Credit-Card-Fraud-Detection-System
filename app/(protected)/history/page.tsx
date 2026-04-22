// app/(protected)/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { TransactionFilters } from '@/components/transaction-filters';
import { Download, Eye } from 'lucide-react';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { getAuthToken } = useAuth();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      apiClient.setToken(token);
    }

    const fetchTransactions = async () => {
      try {
        const data = await apiClient.getTransactionHistory({ limit: 100 });
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Failed to fetch transaction history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [getAuthToken]);

  const filteredTransactions = transactions.filter(tx => {
    if (!filters) return true;

    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      if (!tx.transaction_id.toLowerCase().includes(search) &&
          !tx.customer_name.toLowerCase().includes(search)) {
        return false;
      }
    }

    if (filters.status !== 'all' && tx.fraud_status !== filters.status) {
      return false;
    }

    if (filters.minAmount && tx.amount < parseFloat(filters.minAmount)) {
      return false;
    }

    if (filters.maxAmount && tx.amount > parseFloat(filters.maxAmount)) {
      return false;
    }

    if (filters.category && tx.merchant_category !== filters.category) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fraudulent':
        return 'bg-red-100 text-red-700';
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground mt-2">View and manage all analyzed transactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground font-medium">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <TransactionFilters onFilterChange={setFilters} />

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Transaction ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Risk Score</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  Loading transactions...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx: any) => (
                <tr key={tx.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-mono">{tx.transaction_id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-foreground">{tx.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-semibold">${tx.amount?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{tx.merchant_category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.fraud_status)}`}>
                      {tx.fraud_status?.charAt(0).toUpperCase() + tx.fraud_status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            tx.fraud_probability > 0.7 ? 'bg-red-500' :
                            tx.fraud_probability > 0.4 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${tx.fraud_probability * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{(tx.fraud_probability * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedTransaction(tx)}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-background">
              <h2 className="text-xl font-bold text-foreground">Transaction Details</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="text-foreground font-mono">{selectedTransaction.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-foreground font-semibold">${selectedTransaction.amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="text-foreground">{selectedTransaction.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedTransaction.fraud_status)}`}>
                    {selectedTransaction.fraud_status?.charAt(0).toUpperCase() + selectedTransaction.fraud_status?.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fraud Probability</p>
                  <p className="text-foreground font-semibold">{(selectedTransaction.fraud_probability * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-foreground">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedTransaction.risk_factors && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Risk Factors</p>
                  <div className="space-y-2">
                    {selectedTransaction.risk_factors.map((factor: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="font-medium text-foreground">{factor.factor}</p>
                        <p className="text-sm text-muted-foreground mt-1">{factor.description}</p>
                        <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${
                          factor.severity === 'high' ? 'bg-red-100 text-red-700' :
                          factor.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {factor.severity.charAt(0).toUpperCase() + factor.severity.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
