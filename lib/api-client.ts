// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class APIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Transaction endpoints
  async analyzeTransaction(data: any) {
    return this.request('/transactions/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactionHistory(params: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value));
    });

    return this.request(`/transactions/history?${query.toString()}`);
  }

  // Dashboard endpoints
  async getDashboardStats(days: number = 7) {
    return this.request(`/dashboard/stats?days=${days}`);
  }

  async getDashboardTrends(days: number = 7) {
    return this.request(`/dashboard/trends?days=${days}`);
  }

  async getCategoryRisk() {
    return this.request('/dashboard/category-risk');
  }

  // Alert endpoints
  async getAlerts(params: { page?: number; limit?: number; resolved?: boolean } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, String(value));
    });

    return this.request(`/alerts?${query.toString()}`);
  }

  async updateAlert(alertId: string, data: any) {
    return this.request(`/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Audit trail endpoints
  async getAuditTrail(params: {
    page?: number;
    limit?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value));
    });

    return this.request(`/audit-trail?${query.toString()}`);
  }

  // Batch processing endpoints
  async submitBatchJob(formData: FormData) {
    const token = this.token;
    const response = await fetch(`${this.baseUrl}/batch/submit`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Batch submission failed: ${response.status}`);
    }

    return response.json();
  }

  async getBatchJobStatus(jobId: string) {
    return this.request(`/batch/status/${jobId}`);
  }

  async getBatchJobResult(jobId: string) {
    return this.request(`/batch/result/${jobId}`);
  }

  // Health check
  async healthCheck() {
    return fetch(`${this.baseUrl}/../health`).then(r => r.json());
  }
}

export const apiClient = new APIClient();
