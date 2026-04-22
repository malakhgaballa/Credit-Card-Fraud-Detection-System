"use client";

import { TrendingUp, Shield, AlertTriangle, Clock } from "lucide-react";

const stats = [
  {
    label: "Total Analyzed",
    value: "1.28M",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Fraud Detected",
    value: "7,842",
    change: "-3.2%",
    trend: "down",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    label: "Blocked Amount",
    value: "$2.4M",
    change: "+8.1%",
    trend: "up",
    icon: Shield,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "Avg Response Time",
    value: "45ms",
    change: "-15.3%",
    trend: "down",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </span>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {stat.value}
            </span>
            <span
              className={`text-sm font-medium ${
                stat.trend === "up" && stat.label !== "Fraud Detected"
                  ? "text-success"
                  : stat.trend === "down" && stat.label === "Fraud Detected"
                  ? "text-success"
                  : stat.trend === "down" && stat.label === "Avg Response Time"
                  ? "text-success"
                  : "text-muted-foreground"
              }`}
            >
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
