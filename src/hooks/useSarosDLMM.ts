/**
 * Custom React hook for Saros DLMM data fetching and state management
 * Central data layer for the portfolio analytics dashboard
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import SarosDLMMService from '@/services/dlmmService';
import { PositionData, PortfolioSummary } from '@/types';

/**
 * Return type for the useSarosDLMM hook
 */
interface UseSarosDLMMReturn {
  // Data state
  positions: PositionData[];
  summary: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connected: boolean;

  // Actions
  refreshData: () => Promise<void>;

  // Computed values
  hasPositions: boolean;
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  inRangeCount: number;
  outOfRangeCount: number;
  averageAPY: number;
  riskScore: number;
  topPerformer: string;
  worstPerformer: string;
}

/**
 * Custom hook for managing Saros DLMM portfolio data
 * Handles data fetching, state management, and auto-refresh functionality
 */
export function useSarosDLMM(): UseSarosDLMMReturn {
  // Wallet and connection state
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  // Core data state
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Service instance ref to avoid recreating
  const serviceRef = useRef<SarosDLMMService | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize or get the DLMM service instance
   */
  const getService = useCallback((): SarosDLMMService => {
    if (!serviceRef.current) {
      console.log('Initializing Saros DLMM Service');
      const rpcEndpoint = connection.rpcEndpoint;
      serviceRef.current = new SarosDLMMService(rpcEndpoint);
    }
    return serviceRef.current;
  }, [connection.rpcEndpoint]);

  /**
   * Fetch user positions and portfolio summary
   */
  const fetchData = useCallback(async (): Promise<void> => {
    console.log('Fetching DLMM data...');
    
    // Clear data if wallet not connected
    if (!connected || !publicKey) {
      console.log('Wallet not connected, clearing data');
      setPositions([]);
      setSummary(null);
      setError(null);
      setLastUpdate(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching positions for wallet:', publicKey.toString());
      const service = getService();
      
      // Fetch user positions
      const userPositions = await service.getUserPositions(publicKey.toString());
      console.log(`Fetched ${userPositions.length} positions`);

      // Calculate portfolio summary
      const portfolioSummary = await service.getPortfolioSummary(userPositions);
      console.log('Portfolio summary calculated:', portfolioSummary);

      // Update state
      setPositions(userPositions);
      setSummary(portfolioSummary);
      setLastUpdate(new Date());

      console.log('Data fetch completed successfully');

    } catch (err) {
      console.error('Error fetching DLMM data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio data';
      setError(errorMessage);
      
      // Set empty data on error
      setPositions([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, getService]);

  /**
   * Refresh data manually
   */
  const refreshData = useCallback(async (): Promise<void> => {
    console.log('Manual data refresh triggered');
    await fetchData();
  }, [fetchData]);

  /**
   * Set up auto-refresh interval
   */
  const setupAutoRefresh = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval (60 seconds)
    intervalRef.current = setInterval(() => {
      if (connected && publicKey) {
        console.log('Auto-refreshing DLMM data...');
        fetchData();
      }
    }, 60000); // 60 seconds

    console.log('Auto-refresh interval set up (60s)');
  }, [connected, publicKey, fetchData]);

  /**
   * Clean up auto-refresh interval
   */
  const cleanupAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      console.log('Cleaning up auto-refresh interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Effect: Fetch data when wallet connects
  useEffect(() => {
    console.log('Wallet connection changed:', { connected, publicKey: publicKey?.toString() });
    
    if (connected && publicKey) {
      console.log('Wallet connected, fetching initial data');
      fetchData();
    } else {
      console.log('Wallet disconnected, clearing data');
      setPositions([]);
      setSummary(null);
      setError(null);
      setLastUpdate(null);
    }
  }, [connected, publicKey, fetchData]);

  // Effect: Set up auto-refresh
  useEffect(() => {
    if (connected && publicKey) {
      setupAutoRefresh();
    } else {
      cleanupAutoRefresh();
    }

    // Cleanup on unmount
    return () => {
      cleanupAutoRefresh();
    };
  }, [connected, publicKey, setupAutoRefresh, cleanupAutoRefresh]);

  // Computed values
  const hasPositions = positions.length > 0;
  const totalValue = summary?.totalValueUSD || 0;
  const totalPnL = summary?.totalPnlUSD || 0;
  const totalPnLPercentage = summary?.totalPnlPercentage || 0;
  const inRangeCount = summary?.inRangePositions || 0;
  const outOfRangeCount = summary?.outOfRangePositions || 0;
  const averageAPY = summary?.averageAPY || 0;
  const riskScore = summary?.riskScore || 0;
  const topPerformer = summary?.topPerformer || '';
  const worstPerformer = summary?.worstPerformer || '';

  // Debug logging for state changes
  useEffect(() => {
    console.log('DLMM Hook State Update:', {
      positionsCount: positions.length,
      hasSummary: !!summary,
      loading,
      error,
      connected,
      hasPositions,
      totalValue,
      totalPnL,
      totalPnLPercentage,
      inRangeCount,
      outOfRangeCount,
      averageAPY,
      riskScore
    });
  }, [
    positions.length,
    summary,
    loading,
    error,
    connected,
    hasPositions,
    totalValue,
    totalPnL,
    totalPnLPercentage,
    inRangeCount,
    outOfRangeCount,
    averageAPY,
    riskScore
  ]);

  return {
    // Data state
    positions,
    summary,
    loading,
    error,
    lastUpdate,
    connected,

    // Actions
    refreshData,

    // Computed values
    hasPositions,
    totalValue,
    totalPnL,
    totalPnLPercentage,
    inRangeCount,
    outOfRangeCount,
    averageAPY,
    riskScore,
    topPerformer,
    worstPerformer,
  };
}

/**
 * Hook for getting filtered positions based on criteria
 * @param positions - Array of positions to filter
 * @param filters - Filter criteria
 * @returns Filtered positions
 */
export function useFilteredPositions(
  positions: PositionData[],
  filters: {
    riskLevel?: string[];
    inRange?: boolean;
    pairName?: string;
    minPnlPercentage?: number;
    maxPnlPercentage?: number;
    minAPY?: number;
    maxAPY?: number;
  } = {}
): PositionData[] {
  return positions.filter(position => {
    // Risk level filter
    if (filters.riskLevel && filters.riskLevel.length > 0) {
      if (!filters.riskLevel.includes(position.riskLevel)) {
        return false;
      }
    }

    // In range filter
    if (filters.inRange !== undefined) {
      if (position.inRange !== filters.inRange) {
        return false;
      }
    }

    // Pair name filter
    if (filters.pairName && filters.pairName.trim() !== '') {
      if (!position.pairName.toLowerCase().includes(filters.pairName.toLowerCase())) {
        return false;
      }
    }

    // PnL percentage filters
    if (filters.minPnlPercentage !== undefined) {
      if (position.pnlPercentage < filters.minPnlPercentage) {
        return false;
      }
    }
    if (filters.maxPnlPercentage !== undefined) {
      if (position.pnlPercentage > filters.maxPnlPercentage) {
        return false;
      }
    }

    // APY filters
    if (filters.minAPY !== undefined) {
      if (position.apy < filters.minAPY) {
        return false;
      }
    }
    if (filters.maxAPY !== undefined) {
      if (position.apy > filters.maxAPY) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Hook for getting sorted positions
 * @param positions - Array of positions to sort
 * @param sortField - Field to sort by
 * @param sortDirection - Sort direction
 * @returns Sorted positions
 */
export function useSortedPositions(
  positions: PositionData[],
  sortField: keyof PositionData,
  sortDirection: 'asc' | 'desc' = 'desc'
): PositionData[] {
  return [...positions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    return 0;
  });
}

/**
 * Hook for getting paginated positions
 * @param positions - Array of positions to paginate
 * @param page - Current page (1-based)
 * @param limit - Items per page
 * @returns Paginated positions and pagination info
 */
export function usePaginatedPositions(
  positions: PositionData[],
  page: number = 1,
  limit: number = 10
): {
  paginatedPositions: PositionData[];
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItems: number;
} {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const totalItems = positions.length;
  const totalPages = Math.ceil(totalItems / limit);
  
  const paginatedPositions = positions.slice(startIndex, endIndex);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    paginatedPositions,
    totalPages,
    hasNextPage,
    hasPrevPage,
    totalItems,
  };
}

/**
 * Hook for getting portfolio statistics
 * @param positions - Array of positions
 * @returns Portfolio statistics
 */
export function usePortfolioStats(positions: PositionData[]) {
  const totalPositions = positions.length;
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValueUSD, 0);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnlUSD, 0);
  const totalFees = positions.reduce((sum, pos) => sum + pos.totalFeesUSD, 0);
  const inRangePositions = positions.filter(pos => pos.inRange).length;
  const outOfRangePositions = totalPositions - inRangePositions;
  
  const riskDistribution = positions.reduce((acc, pos) => {
    acc[pos.riskLevel] = (acc[pos.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageAPY = totalValue > 0 
    ? positions.reduce((sum, pos) => sum + (pos.apy * pos.currentValueUSD), 0) / totalValue
    : 0;

  const bestPerformer = positions.reduce((best, pos) => 
    pos.pnlPercentage > best.pnlPercentage ? pos : best, positions[0] || null
  );

  const worstPerformer = positions.reduce((worst, pos) => 
    pos.pnlPercentage < worst.pnlPercentage ? pos : worst, positions[0] || null
  );

  return {
    totalPositions,
    totalValue,
    totalPnL,
    totalFees,
    inRangePositions,
    outOfRangePositions,
    riskDistribution,
    averageAPY,
    bestPerformer,
    worstPerformer,
  };
}

export default useSarosDLMM;
