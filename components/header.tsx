"use client";

import { Shield, Activity } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                FraudShield
              </h1>
              <p className="text-xs text-muted-foreground">
                Credit Card Fraud Detection
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5">
              <Activity className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">
                Model Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
