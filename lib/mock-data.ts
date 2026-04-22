// lib/mock-data.ts
// Mock data service for development and demo purposes

export const generateMockDashboardStats = (days: number = 7) => {
  const totalTransactions = Math.floor(Math.random() * 5000) + 8500;
  const fraudDetected = Math.floor(totalTransactions * (Math.random() * 0.08 + 0.03));
  const detectionRate = (fraudDetected / totalTransactions) * 100;

  return {
    total_transactions: totalTransactions,
    fraud_detected: fraudDetected,
    detection_rate: detectionRate,
    pending_reviews: Math.floor(fraudDetected * 0.15),
    fraudulent_amount: fraudDetected * (Math.random() * 15000 + 2000),
    legitimate_amount: (totalTransactions - fraudDetected) * (Math.random() * 1500 + 500),
    average_fraud_probability: Math.random() * 0.4 + 0.1,
    false_positive_rate: Math.random() * 2 + 0.5,
    avg_response_time_ms: Math.floor(Math.random() * 200) + 50,
  };
};

export const generateMockTrendData = (days: number = 7) => {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      transactions: Math.floor(Math.random() * 1000) + 800,
      fraud: Math.floor(Math.random() * 80) + 20,
      detection_rate: (Math.random() * 5 + 2).toFixed(2),
    });
  }

  return data;
};

export const generateMockCategoryRiskData = () => {
  return [
    { category: 'Retail', risk_score: 12, transactions: 2400, fraud_count: 85 },
    { category: 'E-commerce', risk_score: 28, transactions: 1800, fraud_count: 145 },
    { category: 'Travel', risk_score: 35, transactions: 950, fraud_count: 92 },
    { category: 'Entertainment', risk_score: 18, transactions: 1200, fraud_count: 48 },
    { category: 'Gas/Fuel', risk_score: 8, transactions: 1400, fraud_count: 22 },
    { category: 'Restaurant', risk_score: 15, transactions: 1100, fraud_count: 35 },
    { category: 'Wire Transfer', risk_score: 52, transactions: 320, fraud_count: 125 },
    { category: 'Cash Advance', risk_score: 48, transactions: 280, fraud_count: 78 },
  ];
};

export const generateMockTransactionHistory = () => {
  const customers = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Lisa Brown', 'David Wilson', 'Emma Davis'];
  const categories = ['Retail', 'E-commerce', 'Travel', 'Entertainment', 'Gas/Fuel', 'Restaurant'];
  const statuses = ['legitimate', 'suspicious', 'fraudulent'];

  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    transaction_id: `TXN-${Date.now()}-${i}`,
    customer_name: customers[Math.floor(Math.random() * customers.length)],
    amount: parseFloat((Math.random() * 5000 + 10).toFixed(2)),
    merchant_category: categories[Math.floor(Math.random() * categories.length)],
    fraud_status: statuses[Math.floor(Math.random() * statuses.length)],
    fraud_probability: Math.random(),
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    risk_factors: [
      {
        factor: 'High Amount',
        description: 'Transaction amount is significantly above customer average',
        severity: Math.random() > 0.5 ? 'high' : 'medium',
      },
      {
        factor: 'Geographic Anomaly',
        description: 'Transaction location is unusual for this customer',
        severity: Math.random() > 0.7 ? 'high' : 'low',
      },
      {
        factor: 'Time Anomaly',
        description: 'Transaction at unusual time for this customer',
        severity: 'low',
      },
    ],
  }));
};

export const generateMockAlerts = () => {
  return [
    {
      id: 1,
      transaction_id: 'TXN-001',
      alert_type: 'high_fraud_probability',
      priority: 'critical',
      description: 'Wire transfer of $15,000 to unknown merchant',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_resolved: false,
    },
    {
      id: 2,
      transaction_id: 'TXN-002',
      alert_type: 'geographic_anomaly',
      priority: 'high',
      description: 'Transaction 2,500km from customer location',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      is_resolved: false,
    },
    {
      id: 3,
      transaction_id: 'TXN-003',
      alert_type: 'velocity_check',
      priority: 'medium',
      description: 'Multiple transactions within 15 minutes',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      is_resolved: true,
    },
    {
      id: 4,
      transaction_id: 'TXN-004',
      alert_type: 'unusual_time',
      priority: 'low',
      description: 'Transaction at 3 AM (unusual for this customer)',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      is_resolved: true,
    },
  ];
};

export const generateMockAuditTrail = () => {
  const actions = ['analyzed', 'viewed', 'approved', 'rejected', 'flagged'];
  const users = ['analyst@bank.com', 'admin@bank.com', 'reviewer@bank.com'];

  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    transaction_id: `TXN-${1000 + i}`,
    user_id: Math.floor(Math.random() * 10) + 1,
    action: actions[Math.floor(Math.random() * actions.length)],
    resource_type: 'transaction',
    resource_id: i + 1,
    changes: {
      status: { old: 'pending', new: 'reviewed' },
      notes: 'Transaction reviewed and approved',
    },
    ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

export const generateMockSystemMetrics = () => {
  return {
    api_uptime_percentage: 99.9,
    avg_response_time_ms: Math.floor(Math.random() * 200) + 50,
    error_rate_percentage: (Math.random() * 0.5).toFixed(2),
    active_users: Math.floor(Math.random() * 50) + 10,
    db_query_time_ms: Math.floor(Math.random() * 150) + 25,
    model_inference_time_ms: Math.floor(Math.random() * 100) + 20,
    cache_hit_rate: (Math.random() * 20 + 75).toFixed(1),
    queue_depth: Math.floor(Math.random() * 20),
  };
};
