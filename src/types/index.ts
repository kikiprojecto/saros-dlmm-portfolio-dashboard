/**
 * Core data interfaces for Saros DLMM Portfolio Analytics Dashboard
 */

// Time frame options for charts and analytics
export type TimeFrame = '24h' | '7d' | '30d' | '90d' | 'all';

// Risk levels for position assessment
export type RiskLevel = 'Low' | 'Medium' | 'High';

// Position status for range checking
export type PositionStatus = 'in-range' | 'out-of-range' | 'near-range';

/**
 * Individual DLMM position data
 * Represents a single liquidity position in a DLMM pool
 */
export interface PositionData {
  /** Unique identifier for the position */
  id: string;
  
  /** Solana address of the DLMM pool */
  poolAddress: string;
  
  /** Human-readable pair name (e.g., "SOL-USDC") */
  pairName: string;
  
  /** Total liquidity provided in USD */
  liquidity: number;
  
  /** Current value of the position in USD */
  currentValueUSD: number;
  
  /** Initial investment value in USD */
  initialValueUSD: number;
  
  /** Total fees earned in USD */
  totalFeesUSD: number;
  
  /** Profit/Loss in USD (currentValueUSD - initialValueUSD + totalFeesUSD) */
  pnlUSD: number;
  
  /** Profit/Loss percentage */
  pnlPercentage: number;
  
  /** Annual Percentage Yield */
  apy: number;
  
  /** Amount of token X in the position */
  tokenXAmount: number;
  
  /** Amount of token Y in the position */
  tokenYAmount: number;
  
  /** Symbol of token X (e.g., "SOL") */
  tokenXSymbol: string;
  
  /** Symbol of token Y (e.g., "USDC") */
  tokenYSymbol: string;
  
  /** Lower bound of the price range */
  priceRangeLower: number;
  
  /** Upper bound of the price range */
  priceRangeUpper: number;
  
  /** Current market price of the pair */
  currentPrice: number;
  
  /** Whether the current price is within the position's range */
  inRange: boolean;
  
  /** Risk assessment of the position */
  riskLevel: RiskLevel;
  
  /** Number of active bins in the position */
  activeBins: number;
  
  /** Last time the position data was updated */
  lastUpdated: Date;
  
  /** Additional metadata */
  metadata?: {
    /** Pool fee tier (e.g., 0.01 for 1%) */
    feeTier?: number;
    /** Pool volume 24h in USD */
    volume24h?: number;
    /** Pool TVL in USD */
    tvl?: number;
    /** Position creation date */
    createdAt?: Date;
    /** Last rebalancing date */
    lastRebalanced?: Date;
  };
}

/**
 * Portfolio summary statistics
 * Aggregated data across all positions
 */
export interface PortfolioSummary {
  /** Total portfolio value in USD */
  totalValueUSD: number;
  
  /** Total profit/loss in USD */
  totalPnlUSD: number;
  
  /** Total profit/loss percentage */
  totalPnlPercentage: number;
  
  /** Total fees earned across all positions */
  totalFeesUSD: number;
  
  /** Average APY across all positions */
  averageAPY: number;
  
  /** Number of active positions */
  activePositions: number;
  
  /** Number of positions currently in range */
  inRangePositions: number;
  
  /** Number of positions currently out of range */
  outOfRangePositions: number;
  
  /** Overall portfolio risk score (0-100) */
  riskScore: number;
  
  /** ID of the best performing position */
  topPerformer: string;
  
  /** ID of the worst performing position */
  worstPerformer: string;
  
  /** Additional portfolio metrics */
  metrics?: {
    /** Portfolio diversification score (0-100) */
    diversificationScore?: number;
    /** Average position size in USD */
    averagePositionSize?: number;
    /** Largest position size in USD */
    largestPositionSize?: number;
    /** Portfolio volatility score (0-100) */
    volatilityScore?: number;
    /** Total number of different tokens */
    uniqueTokens?: number;
    /** Portfolio age in days */
    portfolioAge?: number;
  };
}

/**
 * Chart data point for Recharts
 * Used for portfolio value, PnL, and other time-series charts
 */
export interface ChartDataPoint {
  /** Timestamp for the data point */
  timestamp: Date;
  
  /** Date string for display */
  date: string;
  
  /** Time string for display */
  time: string;
  
  /** Value for the primary metric */
  value: number;
  
  /** Secondary value (e.g., fees, volume) */
  secondaryValue?: number;
  
  /** Label for the data point */
  label?: string;
  
  /** Additional data for tooltips */
  metadata?: {
    /** Number of positions at this time */
    positionCount?: number;
    /** In-range positions count */
    inRangeCount?: number;
    /** Average APY at this time */
    averageAPY?: number;
    /** Risk score at this time */
    riskScore?: number;
  };
}

/**
 * Pool information for DLMM pools
 */
export interface PoolInfo {
  /** Pool address */
  address: string;
  
  /** Token pair name */
  pairName: string;
  
  /** Token X information */
  tokenX: {
    symbol: string;
    mint: string;
    decimals: number;
    logoURI?: string;
  };
  
  /** Token Y information */
  tokenY: {
    symbol: string;
    mint: string;
    decimals: number;
    logoURI?: string;
  };
  
  /** Pool fee tier (e.g., 0.01 for 1%) */
  feeTier: number;
  
  /** Current pool price */
  currentPrice: number;
  
  /** Pool TVL in USD */
  tvl: number;
  
  /** 24h volume in USD */
  volume24h: number;
  
  /** 24h fees in USD */
  fees24h: number;
  
  /** Pool creation date */
  createdAt: Date;
  
  /** Pool status */
  status: 'active' | 'paused' | 'inactive';
}

/**
 * User wallet information
 */
export interface WalletInfo {
  /** Wallet public key */
  publicKey: string;
  
  /** Wallet address (base58 encoded) */
  address: string;
  
  /** Wallet balance in SOL */
  balance: number;
  
  /** Wallet balance in USD */
  balanceUSD: number;
  
  /** Connected wallet adapter name */
  adapterName: string;
  
  /** Whether wallet is connected */
  connected: boolean;
  
  /** Last connection time */
  lastConnected?: Date;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  
  /** Success status */
  success: boolean;
  
  /** Error message if any */
  error?: string;
  
  /** Response timestamp */
  timestamp: Date;
  
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Chart configuration options
 */
export interface ChartConfig {
  /** Chart type */
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter';
  
  /** Chart title */
  title: string;
  
  /** Chart description */
  description?: string;
  
  /** X-axis label */
  xAxisLabel?: string;
  
  /** Y-axis label */
  yAxisLabel?: string;
  
  /** Chart height in pixels */
  height?: number;
  
  /** Chart width in pixels */
  width?: number;
  
  /** Whether to show grid */
  showGrid?: boolean;
  
  /** Whether to show legend */
  showLegend?: boolean;
  
  /** Chart colors */
  colors?: string[];
  
  /** Animation duration in ms */
  animationDuration?: number;
}

/**
 * Filter options for positions
 */
export interface PositionFilters {
  /** Filter by risk level */
  riskLevel?: RiskLevel[];
  
  /** Filter by in-range status */
  inRange?: boolean;
  
  /** Filter by pair name */
  pairName?: string;
  
  /** Filter by minimum PnL percentage */
  minPnlPercentage?: number;
  
  /** Filter by maximum PnL percentage */
  maxPnlPercentage?: number;
  
  /** Filter by minimum APY */
  minAPY?: number;
  
  /** Filter by maximum APY */
  maxAPY?: number;
  
  /** Filter by minimum value */
  minValue?: number;
  
  /** Filter by maximum value */
  maxValue?: number;
}

/**
 * Sort options for positions
 */
export interface PositionSort {
  /** Field to sort by */
  field: keyof PositionData;
  
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Current page number (1-based) */
  page: number;
  
  /** Number of items per page */
  limit: number;
  
  /** Total number of items */
  total: number;
  
  /** Total number of pages */
  totalPages: number;
}

/**
 * Error types for the application
 */
export interface AppError {
  /** Error code */
  code: string;
  
  /** Error message */
  message: string;
  
  /** Error details */
  details?: any;
  
  /** Error timestamp */
  timestamp: Date;
  
  /** Whether the error is recoverable */
  recoverable: boolean;
}

/**
 * Loading states for async operations
 */
export interface LoadingState {
  /** Whether the operation is loading */
  loading: boolean;
  
  /** Error if the operation failed */
  error?: AppError;
  
  /** Last successful data */
  data?: any;
  
  /** Operation start time */
  startTime?: Date;
  
  /** Operation end time */
  endTime?: Date;
}
