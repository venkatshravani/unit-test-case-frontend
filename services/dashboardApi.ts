// Dashboard API Service
// Replace these URLs with your actual API endpoints

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const dashboardApi = {
  // Fetch summary/KPI data
  summary: async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
          // 'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
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
      });
      if (!response.ok) throw new Error('Failed to fetch invoices');
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
      });
      if (!response.ok) throw new Error('Failed to fetch aging data');
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
      });
      if (!response.ok) throw new Error('Failed to fetch forecast');
      return await response.json();
    } catch (error) {
      console.error('Forecast API error:', error);
      throw error;
    }
  },
};
