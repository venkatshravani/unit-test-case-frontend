import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency based on currency type
 * USD: $16,630,000 (standard formatting)
 * INR: ₹16,63,00,000 (Indian numbering system)
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'INR') {
    // Indian numbering system: ₹16,63,00,000
    const indianFormatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return indianFormatter.format(amount)
  } else {
    // USD: $16,630,000
    const usdFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return usdFormatter.format(amount)
  }
}

/**
 * Format number with thousand separators based on currency
 */
export function formatNumber(amount: number, currency: string = 'USD'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } else {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
}
