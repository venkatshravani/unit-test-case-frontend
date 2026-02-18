'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/dashboardApi';
import { allInvoices, computeKPIs, computeAgingBuckets, computeCashflow } from '@/lib/data';

export interface DashboardData {
  summary: any;
  invoices: any[];
  aging: any;
  forecast: any;
}

export function useDashboard(retries = 2) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`[v0] Fetching dashboard data (attempt ${attempt}/${retries})`);
          
          const [summary, invoices, aging, forecast] = await Promise.all([
            dashboardApi.summary().catch(() => null),
            dashboardApi.invoices().catch(() => null),
            dashboardApi.aging().catch(() => null),
            dashboardApi.forecast().catch(() => null),
          ]);

          // If we got at least some data, use it
          if (summary || invoices || aging || forecast) {
            console.log('[v0] Dashboard data loaded from API');
            setData({
              summary: summary || computeKPIs(allInvoices),
              invoices: Array.isArray(invoices) ? invoices : allInvoices,
              aging: aging || computeAgingBuckets(allInvoices),
              forecast: forecast || computeCashflow(allInvoices),
            });
            setError(null);
            setLoading(false);
            return;
          }

          // If all failed, try again on next attempt
          if (attempt === retries) {
            throw new Error('All API endpoints failed');
          }
        } catch (err: any) {
          console.error(`[v0] Dashboard load error (attempt ${attempt}):`, err?.message);
          
          if (attempt === retries) {
            // Use mock data as fallback
            console.log('[v0] Using mock data as fallback');
            setData({
              summary: computeKPIs(allInvoices),
              invoices: allInvoices,
              aging: computeAgingBuckets(allInvoices),
              forecast: computeCashflow(allInvoices),
            });
            setError('Using sample data - Backend API is unavailable. Ensure NEXT_PUBLIC_API_URL is set correctly.');
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
