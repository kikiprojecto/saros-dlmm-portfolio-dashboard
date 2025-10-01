/**
 * Utility functions for formatting data in the Saros DLMM Portfolio Dashboard
 */

import { RiskLevel } from '@/types';

/**
 * Format a number as currency with appropriate suffixes
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "$1.5M", "$1.2K", "$1,234.56")
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000).toFixed(decimals)}B`;
  } else if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(decimals)}M`;
  } else if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(decimals)}K`;
  } else if (absValue === 0) {
    return '$0.00';
  } else {
    return `${sign}$${absValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }
}

/**
 * Format a number as percentage with appropriate sign
 * @param value - The number to format (as decimal, e.g., 0.0523 for 5.23%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "+5.23%", "-2.15%", "0.00%")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }

  const percentage = value * 100;
  const sign = percentage > 0 ? '+' : '';
  
  if (percentage === 0) {
    return '0.00%';
  }

  return `${sign}${percentage.toFixed(decimals)}%`;
}

/**
 * Format a number with appropriate suffixes (without currency symbol)
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string (e.g., "1.5M", "1.2K", "1,234.56")
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`;
  } else if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`;
  } else if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(decimals)}K`;
  } else if (absValue === 0) {
    return '0';
  } else {
    return `${sign}${absValue.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }
}

/**
 * Format a Solana address with ellipsis
 * @param address - The address to format
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Formatted address string (e.g., "ABC1...XYZ9")
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address || typeof address !== 'string') {
    return 'Unknown';
  }

  if (address.length <= chars * 2 + 3) {
    return address;
  }

  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format a date to human-readable string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jan 15, 2:30 PM")
 */
export function formatDate(date: Date | string | number): string {
  if (!date) {
    return 'Unknown';
  }

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date to relative time string
 * @param date - The date to format
 * @returns Relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) {
    return 'Unknown';
  }

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
}

/**
 * Get Tailwind CSS classes for risk level
 * @param risk - The risk level
 * @returns Tailwind CSS classes for styling
 */
export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'Low':
      return 'text-success-600 bg-success-100 border-success-200';
    case 'Medium':
      return 'text-warning-600 bg-warning-100 border-warning-200';
    case 'High':
      return 'text-danger-600 bg-danger-100 border-danger-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

/**
 * Get Tailwind CSS classes for position status
 * @param inRange - Whether the position is in range
 * @returns Tailwind CSS classes for styling
 */
export function getStatusColor(inRange: boolean): string {
  return inRange
    ? 'text-success-600 bg-success-100 border-success-200'
    : 'text-danger-600 bg-danger-100 border-danger-200';
}

/**
 * Get Tailwind CSS classes for PnL value
 * @param value - The PnL value
 * @returns Tailwind CSS classes for styling
 */
export function getPnlColor(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'text-gray-600';
  }

  if (value > 0) {
    return 'text-success-600';
  } else if (value < 0) {
    return 'text-danger-600';
  } else {
    return 'text-gray-600';
  }
}

/**
 * Get Tailwind CSS classes for APY value
 * @param value - The APY value
 * @returns Tailwind CSS classes for styling
 */
export function getApyColor(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'text-gray-600';
  }

  if (value >= 0.1) { // 10% or higher
    return 'text-success-600';
  } else if (value >= 0.05) { // 5% or higher
    return 'text-warning-600';
  } else if (value >= 0) { // Positive but low
    return 'text-primary-600';
  } else { // Negative
    return 'text-danger-600';
  }
}

/**
 * Format a large number with appropriate precision
 * @param value - The number to format
 * @param maxDecimals - Maximum number of decimal places
 * @returns Formatted number string
 */
export function formatPreciseNumber(value: number, maxDecimals: number = 6): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  if (value === 0) {
    return '0';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1) {
    return `${sign}${absValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.min(maxDecimals, 2),
    })}`;
  } else {
    // For very small numbers, show more decimal places
    const decimals = Math.max(maxDecimals, 4);
    return `${sign}${absValue.toFixed(decimals).replace(/\.?0+$/, '')}`;
  }
}

/**
 * Format a token amount with appropriate decimals
 * @param amount - The token amount
 * @param decimals - Token decimals
 * @param symbol - Token symbol
 * @returns Formatted token amount string
 */
export function formatTokenAmount(
  amount: number,
  decimals: number = 6,
  symbol?: string
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return symbol ? `0 ${symbol}` : '0';
  }

  const formattedAmount = formatPreciseNumber(amount, decimals);
  return symbol ? `${formattedAmount} ${symbol}` : formattedAmount;
}

/**
 * Format a price with appropriate precision
 * @param price - The price to format
 * @param decimals - Number of decimal places
 * @returns Formatted price string
 */
export function formatPrice(price: number, decimals: number = 4): string {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0.00';
  }

  if (price === 0) {
    return '$0.00';
  }

  if (price >= 1) {
    return `$${price.toFixed(decimals)}`;
  } else {
    // For very small prices, show more decimal places
    const precision = Math.max(decimals, 6);
    return `$${price.toFixed(precision).replace(/\.?0+$/, '')}`;
  }
}

/**
 * Format a duration in milliseconds to human-readable string
 * @param duration - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m", "45s")
 */
export function formatDuration(duration: number): string {
  if (duration === null || duration === undefined || isNaN(duration) || duration < 0) {
    return '0s';
  }

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format a file size in bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB", "2.3 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format a percentage change with appropriate styling
 * @param current - Current value
 * @param previous - Previous value
 * @param decimals - Number of decimal places
 * @returns Object with formatted percentage and color classes
 */
export function formatPercentageChange(
  current: number,
  previous: number,
  decimals: number = 2
): { percentage: string; color: string; isPositive: boolean } {
  if (current === null || current === undefined || isNaN(current) ||
      previous === null || previous === undefined || isNaN(previous) ||
      previous === 0) {
    return {
      percentage: '0.00%',
      color: 'text-gray-600',
      isPositive: false,
    };
  }

  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;
  const percentage = formatPercentage(change / 100, decimals);
  const color = isPositive ? 'text-success-600' : 'text-danger-600';

  return {
    percentage,
    color,
    isPositive,
  };
}

/**
 * Format a range string for price ranges
 * @param lower - Lower bound
 * @param upper - Upper bound
 * @param decimals - Number of decimal places
 * @returns Formatted range string (e.g., "$1.20 - $1.80")
 */
export function formatPriceRange(
  lower: number,
  upper: number,
  decimals: number = 4
): string {
  if (lower === null || lower === undefined || isNaN(lower) ||
      upper === null || upper === undefined || isNaN(upper)) {
    return 'N/A';
  }

  const lowerFormatted = formatPrice(lower, decimals);
  const upperFormatted = formatPrice(upper, decimals);

  return `${lowerFormatted} - ${upperFormatted}`;
}

/**
 * Format a bin range for DLMM positions
 * @param lowerBin - Lower bin index
 * @param upperBin - Upper bin index
 * @returns Formatted bin range string (e.g., "Bin 100-150")
 */
export function formatBinRange(lowerBin: number, upperBin: number): string {
  if (lowerBin === null || lowerBin === undefined || isNaN(lowerBin) ||
      upperBin === null || upperBin === undefined || isNaN(upperBin)) {
    return 'N/A';
  }

  if (lowerBin === upperBin) {
    return `Bin ${lowerBin}`;
  }

  return `Bin ${lowerBin}-${upperBin}`;
}
