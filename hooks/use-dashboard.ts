'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/dashboardApi';

export interface DashboardData {
  summary: any;
  invoices: any[];
  aging: any;
  forecast: any;
}

export function useDashboard(retries = 3) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          setLoading(true);
          console.log(`[v0] Fetching dashboard data (attempt ${attempt}/${retries})`);
          
          const [summary, invoices, aging, forecast] = await Promise.all([
            dashboardApi.summary(),
            dashboardApi.invoices(),
            dashboardApi.aging(),
            dashboardApi.forecast(),
          ]);

          console.log('[v0] Dashboard data loaded successfully');
          setData({
            summary,
            invoices: Array.isArray(invoices) ? invoices : invoices?.data || [],
            aging,
            forecast,
          });
          setError(null);
          return;
        } catch (err: any) {
          console.error(`[v0] Dashboard load error (attempt ${attempt}):`, err);
          
          if (attempt === retries) {
            setError(
              err?.message || 
              'Failed to load dashboard data. Check your API connection and ensure NEXT_PUBLIC_API_URL is configured correctly.'
            );
          } else {
            // Exponential backoff before retry
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }
      setLoading(false);
    }

    loadDashboard();
  }, [retries]);

  return { data, loading, error };
}
