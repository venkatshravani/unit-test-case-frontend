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

/**
 * Format date to readable string
 * Input: "2024-11-15" or ISO date
 * Output: "15 Nov 2024"
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "-"
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    
    if (isNaN(date.getTime())) return "-"
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return "-"
  }
}

/**
 * Convert amount between currencies
 * Currently supports USD <-> INR at 1:83 rate
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency || !amount) return amount
  
  const USD_TO_INR = 83
  
  if (fromCurrency === 'USD' && toCurrency === 'INR') {
    return Math.round(amount * USD_TO_INR)
  } else if (fromCurrency === 'INR' && toCurrency === 'USD') {
    return Math.round(amount / USD_TO_INR)
  }
  
  return amount
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'AUD': 'A$',
  }
  return symbols[currency] || currency
}
