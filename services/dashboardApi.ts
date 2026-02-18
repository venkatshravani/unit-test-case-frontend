// Dashboard API Service
// Configured to work with backend API at http://127.0.0.1:8000/api/v1/dashboard

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const dashboardApi = {
  // Fetch summary/KPI data
  summary: async () => {
    try {
      console.log('[v0] Fetching summary from:', `${API_BASE}/dashboard/summary`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${API_BASE}/dashboard/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Summary API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[v0] Summary API success:', data);
      return data;
    } catch (error: any) {
      console.error('[v0] Summary API error:', error?.message || error);
      throw error;
    }
  },

  // Fetch invoices with AR tool fields
  invoices: async () => {
    try {
      console.log('[v0] Fetching invoices from:', `${API_BASE}/dashboard/invoices`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/dashboard/invoices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Invoices API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[v0] Invoices API success:', data);
      return data;
    } catch (error: any) {
      console.error('[v0] Invoices API error:', error?.message || error);
      throw error;
    }
  },

  // Fetch aging buckets data
  aging: async () => {
    try {
      console.log('[v0] Fetching aging from:', `${API_BASE}/dashboard/aging`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/dashboard/aging`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Aging API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[v0] Aging API success:', data);
      return data;
    } catch (error: any) {
      console.error('[v0] Aging API error:', error?.message || error);
      throw error;
    }
  },

  // Fetch cashflow forecast data
  forecast: async () => {
    try {
      console.log('[v0] Fetching forecast from:', `${API_BASE}/dashboard/forecast`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE}/dashboard/forecast`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[v0] Forecast API success:', data);
      return data;
    } catch (error: any) {
      console.error('[v0] Forecast API error:', error?.message || error);
      throw error;
    }
  },
};
