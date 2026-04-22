"use client";

import { useState } from "react";
import {
  User,
  MapPin,
  CreditCard,
  Store,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  CATEGORIES,
  US_STATES,
  JOB_CATEGORIES,
  GENDERS,
  type TransactionFormData,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type AnalysisResult = {
  isFraud: boolean;
  confidence: number;
  riskFactors: string[];
} | null;

export function TransactionForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    name: "",
    gender: "male",
    age: 30,
    job: "business",
    state: "NY",
    cityPopulation: 100000,
    customerLat: 40.7128,
    customerLong: -74.006,
    merchantLat: 40.758,
    merchantLong: -73.9855,
    amount: 50,
    category: "shopping_pos",
    transactionTime: new Date().toISOString().slice(0, 16),
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const analyzeTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResult(null);

    // Simulate ML model analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simple heuristic-based fraud detection simulation
    const riskFactors: string[] = [];
    let riskScore = 0;

    // High amount transactions
    if (formData.amount > 500) {
      riskScore += 25;
      riskFactors.push("High transaction amount");
    }

    // Distance between customer and merchant
    const distance = Math.sqrt(
      Math.pow(formData.customerLat - formData.merchantLat, 2) +
        Math.pow(formData.customerLong - formData.merchantLong, 2)
    );
    if (distance > 5) {
      riskScore += 20;
      riskFactors.push("Large distance from merchant");
    }

    // Late night transactions
    const hour = new Date(formData.transactionTime).getHours();
    if (hour >= 0 && hour < 6) {
      riskScore += 15;
      riskFactors.push("Transaction during unusual hours");
    }

    // Online transactions tend to be riskier
    if (
      formData.category.includes("net") ||
      formData.category === "travel"
    ) {
      riskScore += 10;
      riskFactors.push("High-risk transaction category");
    }

    // Very young or very old
    if (formData.age < 25 || formData.age > 70) {
      riskScore += 5;
      riskFactors.push("Age demographic risk factor");
    }

    // Add some randomness to simulate model uncertainty
    riskScore += Math.random() * 10 - 5;

    const isFraud = riskScore > 40;
    const confidence = Math.min(95, Math.max(60, 100 - Math.abs(riskScore - 50)));

    setResult({
      isFraud,
      confidence,
      riskFactors: riskFactors.length > 0 ? riskFactors : ["No significant risk factors detected"],
    });
    setIsAnalyzing(false);
  };

  const resetForm = () => {
    setResult(null);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <form onSubmit={analyzeTransaction} className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Personal Information
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="age"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min={18}
                  max={100}
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="job"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Occupation
                </label>
                <select
                  id="job"
                  name="job"
                  value={formData.job}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {JOB_CATEGORIES.map((j) => (
                    <option key={j.value} value={j.value}>
                      {j.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Customer Location
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="state"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="cityPopulation"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  City Population
                </label>
                <input
                  type="number"
                  id="cityPopulation"
                  name="cityPopulation"
                  min={0}
                  value={formData.cityPopulation}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="customerLat"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Latitude
                </label>
                <input
                  type="number"
                  id="customerLat"
                  name="customerLat"
                  step="0.0001"
                  value={formData.customerLat}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="customerLong"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Longitude
                </label>
                <input
                  type="number"
                  id="customerLong"
                  name="customerLong"
                  step="0.0001"
                  value={formData.customerLong}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Merchant Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Merchant Location
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="merchantLat"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Merchant Latitude
                </label>
                <input
                  type="number"
                  id="merchantLat"
                  name="merchantLat"
                  step="0.0001"
                  value={formData.merchantLat}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="merchantLong"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Merchant Longitude
                </label>
                <input
                  type="number"
                  id="merchantLong"
                  name="merchantLong"
                  step="0.0001"
                  value={formData.merchantLong}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Transaction Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Transaction Details
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min={0}
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="transactionTime"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Transaction Time
                </label>
                <input
                  type="datetime-local"
                  id="transactionTime"
                  name="transactionTime"
                  value={formData.transactionTime}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Transaction...
              </span>
            ) : (
              "Analyze Transaction"
            )}
          </button>
        </form>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 space-y-6">
          {/* Result Card */}
          <div
            className={cn(
              "rounded-xl border p-6 transition-all",
              result
                ? result.isFraud
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-success/50 bg-success/5"
                : "border-border bg-card"
            )}
          >
            {result ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  {result.isFraud ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                  )}
                  <div>
                    <h3
                      className={cn(
                        "text-xl font-bold",
                        result.isFraud ? "text-destructive" : "text-success"
                      )}
                    >
                      {result.isFraud ? "Fraudulent" : "Legitimate"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {result.confidence.toFixed(1)}% confidence
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">
                    Risk Factors:
                  </h4>
                  <ul className="space-y-1">
                    {result.riskFactors.map((factor, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={resetForm}
                  className="mt-4 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Analyze Another Transaction
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Ready to Analyze
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter transaction details and click &quot;Analyze Transaction&quot; to
                  detect potential fraud.
                </p>
              </div>
            )}
          </div>

          {/* Model Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Model Information
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Algorithm</dt>
                <dd className="font-medium text-foreground">Random Forest</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimators</dt>
                <dd className="font-medium text-foreground">65</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Max Depth</dt>
                <dd className="font-medium text-foreground">57</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Features</dt>
                <dd className="font-medium text-foreground">64</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
