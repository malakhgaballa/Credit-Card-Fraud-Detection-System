import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";
import { TransactionForm } from "@/components/transaction-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Transaction Analysis Dashboard
          </h2>
          <p className="mt-1 text-muted-foreground">
            Analyze credit card transactions in real-time using our Random
            Forest machine learning model.
          </p>
        </div>

        <div className="mb-8">
          <StatsCards />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            New Transaction Analysis
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter transaction details below to check for potential fraud.
          </p>
        </div>

        <TransactionForm />
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>
            Credit Card Fraud Detection System - Powered by Random Forest ML
            Algorithm
          </p>
          <p className="mt-1">
            Model trained on transaction data with 65 estimators and 64 features
          </p>
        </div>
      </footer>
    </div>
  );
}
