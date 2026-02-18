// Dashboard API Service
// Configured to work with backend API at http://127.0.0.1:8000/api/v1/dashboard

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const dashboardApi = {
  // Fetch summary/KPI data
  summary: async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Summary API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Summary API error:', error);
      throw error;
    }
  },

  // Fetch invoices with AR tool fields
  invoices: async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/invoices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Invoices API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Invoices API error:', error);
      throw error;
    }
  },

  // Fetch aging buckets data
  aging: async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/aging`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Aging API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Aging API error:', error);
      throw error;
    }
  },

  // Fetch cashflow forecast data
  forecast: async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/forecast`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Forecast API error:', error);
      throw error;
    }
  },
};
