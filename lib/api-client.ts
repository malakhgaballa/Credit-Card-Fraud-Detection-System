// lib/api-client.ts
import {
  generateMockDashboardStats,
  generateMockTrendData,
  generateMockCategoryRiskData,
  generateMockTransactionHistory,
  generateMockAlerts,
  generateMockAuditTrail,
  generateMockSystemMetrics,
} from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

export class APIClient {
  private baseUrl: string;
  private token: string | null = null;
  private useMockData: boolean;

  constructor(baseUrl: string = API_BASE_URL, useMockData: boolean = USE_MOCK_DATA) {
    this.baseUrl = baseUrl;
    this.useMockData = useMockData;
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
      console.warn(`[v0] API request failed: ${endpoint}, using mock data`);
      if (this.useMockData) {
        // Simulate network delay for realistic feel
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.getMockData<T>(endpoint);
      }
      throw error;
    }
  }

  private getMockData<T>(endpoint: string): T {
    if (endpoint.includes('/dashboard/stats')) {
      return generateMockDashboardStats() as T;
    }
    if (endpoint.includes('/dashboard/trends')) {
      return { data: generateMockTrendData() } as T;
    }
    if (endpoint.includes('/dashboard/category-risk')) {
      return { data: generateMockCategoryRiskData() } as T;
    }
    if (endpoint.includes('/transactions/history')) {
      return { transactions: generateMockTransactionHistory() } as T;
    }
    if (endpoint.includes('/alerts')) {
      return { alerts: generateMockAlerts() } as T;
    }
    if (endpoint.includes('/audit-trail')) {
      return { audit_logs: generateMockAuditTrail() } as T;
    }
    if (endpoint.includes('/metrics')) {
      return generateMockSystemMetrics() as T;
    }
    return {} as T;
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
