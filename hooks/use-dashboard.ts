'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/dashboardApi';

export interface DashboardData {
  summary: any;
  invoices: any[];
  aging: any;
  forecast: any;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [summary, invoices, aging, forecast] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.invoices(),
          dashboardApi.aging(),
          dashboardApi.forecast(),
        ]);

        setData({
          summary,
          invoices,
          aging,
          forecast,
        });
        setError(null);
      } catch (err: any) {
        console.error('Dashboard load error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return { data, loading, error };
}
