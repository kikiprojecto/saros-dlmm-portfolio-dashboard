/**
 * Saros DLMM Service - Core integration with Saros DLMM SDK
 * Handles all DLMM pool interactions, position management, and portfolio analytics
 */

import { DLMM } from '@saros-finance/dlmm-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { 
  PositionData, 
  PortfolioSummary, 
  RiskLevel, 
  TimeFrame,
  PoolInfo,
  WalletInfo 
} from '@/types';

/**
 * Main service class for Saros DLMM operations
 */
export class SarosDLMMService {
  private connection: Connection;
  private dlmm: DLMM;
  private priceCache: Map<string, { price: number; timestamp: number }>;
  private readonly CACHE_TTL = 30000; // 30 seconds

  /**
   * Initialize the Saros DLMM Service
   * @param rpcEndpoint - Solana RPC endpoint URL
   */
  constructor(rpcEndpoint: string) {
    console.log('Initializing Saros DLMM Service with RPC:', rpcEndpoint);
    
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.dlmm = new DLMM(this.connection);
    this.priceCache = new Map();
    
    console.log('Saros DLMM Service initialized successfully');
  }

  /**
   * Get all user positions from DLMM pools
   * @param walletAddress - User's wallet address
   * @returns Array of processed position data
   */
  async getUserPositions(walletAddress: string): Promise<PositionData[]> {
    try {
      console.log('Fetching positions for wallet:', walletAddress);
      
      const userPubkey = new PublicKey(walletAddress);
      const positions = await this.dlmm.getPositionsByUser(userPubkey);
      
      console.log(`Found ${positions.length} positions`);
      
      if (positions.length === 0) {
        console.log('No positions found, returning mock data for demo');
        return this.getMockPositions();
      }

      const processedPositions: PositionData[] = [];
      
      for (const position of positions) {
        try {
          const processedPosition = await this.processPosition(position);
          processedPositions.push(processedPosition);
        } catch (error) {
          console.error('Error processing position:', error);
          // Continue with other positions
        }
      }

      console.log(`Successfully processed ${processedPositions.length} positions`);
      return processedPositions;
      
    } catch (error) {
      console.error('Error fetching user positions:', error);
      console.log('Returning mock data due to error');
      return this.getMockPositions();
    }
  }

  /**
   * Process a raw position into PositionData format
   * @param position - Raw position data from SDK
   * @returns Processed position data
   */
  private async processPosition(position: any): Promise<PositionData> {
    try {
      console.log('Processing position:', position.id || 'unknown');
      
      // Get LB Pair information
      const lbPair = await this.dlmm.getLBPair(position.lbPair);
      if (!lbPair) {
        throw new Error('LB Pair not found');
      }

      // Get token metadata
      const tokenXMetadata = await this.getTokenMetadata(lbPair.tokenXMint.toString());
      const tokenYMetadata = await this.getTokenMetadata(lbPair.tokenYMint.toString());

      // Calculate total token amounts from position bins
      const { tokenXAmount, tokenYAmount } = this.calculateTokenAmounts(position);

      // Get current prices
      const tokenXPrice = await this.getTokenPrice(lbPair.tokenXMint.toString());
      const tokenYPrice = await this.getTokenPrice(lbPair.tokenYMint.toString());

      // Calculate current value in USD
      const currentValueUSD = (tokenXAmount * tokenXPrice) + (tokenYAmount * tokenYPrice);

      // Calculate fees (simplified for demo)
      const feesUSD = this.calculateFeesUSD(position, tokenXPrice, tokenYPrice);

      // Estimate initial value (current value - fees for demo purposes)
      const initialValueUSD = Math.max(0, currentValueUSD - feesUSD);

      // Calculate P&L
      const pnlUSD = currentValueUSD - initialValueUSD + feesUSD;
      const pnlPercentage = initialValueUSD > 0 ? (pnlUSD / initialValueUSD) * 100 : 0;

      // Calculate APY
      const apy = await this.calculateAPY(position, feesUSD, initialValueUSD);

      // Get price range
      const { priceRangeLower, priceRangeUpper } = this.getPriceRange(position, lbPair);

      // Check if position is in range
      const currentPrice = tokenYPrice / tokenXPrice; // Simplified price calculation
      const inRange = currentPrice >= priceRangeLower && currentPrice <= priceRangeUpper;

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(priceRangeLower, priceRangeUpper, currentPrice);

      // Count active bins
      const activeBins = this.countActiveBins(position);

      const processedPosition: PositionData = {
        id: position.id || `pos_${Date.now()}`,
        poolAddress: position.lbPair.toString(),
        pairName: `${tokenXMetadata.symbol}-${tokenYMetadata.symbol}`,
        liquidity: currentValueUSD,
        currentValueUSD,
        initialValueUSD,
        totalFeesUSD: feesUSD,
        pnlUSD,
        pnlPercentage,
        apy,
        tokenXAmount,
        tokenYAmount,
        tokenXSymbol: tokenXMetadata.symbol,
        tokenYSymbol: tokenYMetadata.symbol,
        priceRangeLower,
        priceRangeUpper,
        currentPrice,
        inRange,
        riskLevel,
        activeBins,
        lastUpdated: new Date(),
        metadata: {
          feeTier: lbPair.feeRate ? lbPair.feeRate.toNumber() / 1000000 : 0.01,
          createdAt: position.createdAt ? new Date(position.createdAt) : new Date(),
        }
      };

      console.log('Position processed successfully:', processedPosition.id);
      return processedPosition;

    } catch (error) {
      console.error('Error processing position:', error);
      throw error;
    }
  }

  /**
   * Calculate token amounts from position bins
   * @param position - Raw position data
   * @returns Token amounts
   */
  private calculateTokenAmounts(position: any): { tokenXAmount: number; tokenYAmount: number } {
    let tokenXAmount = 0;
    let tokenYAmount = 0;

    if (position.bins && Array.isArray(position.bins)) {
      for (const bin of position.bins) {
        if (bin.tokenXAmount) {
          tokenXAmount += bin.tokenXAmount.toNumber() / Math.pow(10, 6); // Assuming 6 decimals
        }
        if (bin.tokenYAmount) {
          tokenYAmount += bin.tokenYAmount.toNumber() / Math.pow(10, 6);
        }
      }
    }

    return { tokenXAmount, tokenYAmount };
  }

  /**
   * Calculate fees in USD (simplified calculation)
   * @param position - Raw position data
   * @param tokenXPrice - Token X price in USD
   * @param tokenYPrice - Token Y price in USD
   * @returns Fees in USD
   */
  private calculateFeesUSD(position: any, tokenXPrice: number, tokenYPrice: number): number {
    // Simplified fee calculation for demo
    // In reality, this would be calculated from actual fee events
    const baseFees = 0.1; // $0.10 base fees
    const volumeMultiplier = 0.001; // 0.1% of position value
    
    const positionValue = (position.tokenXAmount || 0) * tokenXPrice + (position.tokenYAmount || 0) * tokenYPrice;
    return baseFees + (positionValue * volumeMultiplier);
  }

  /**
   * Get price range for a position
   * @param position - Raw position data
   * @param lbPair - LB Pair information
   * @returns Price range bounds
   */
  private getPriceRange(position: any, lbPair: any): { priceRangeLower: number; priceRangeUpper: number } {
    // Simplified price range calculation
    // In reality, this would use bin math from the SDK
    const currentPrice = 1.0; // Placeholder
    const rangePercentage = 0.1; // 10% range
    
    return {
      priceRangeLower: currentPrice * (1 - rangePercentage),
      priceRangeUpper: currentPrice * (1 + rangePercentage)
    };
  }

  /**
   * Count active bins in a position
   * @param position - Raw position data
   * @returns Number of active bins
   */
  private countActiveBins(position: any): number {
    if (position.bins && Array.isArray(position.bins)) {
      return position.bins.filter((bin: any) => 
        (bin.tokenXAmount && bin.tokenXAmount.gt(new BN(0))) ||
        (bin.tokenYAmount && bin.tokenYAmount.gt(new BN(0)))
      ).length;
    }
    return 0;
  }

  /**
   * Get portfolio summary from positions
   * @param positions - Array of position data
   * @returns Portfolio summary statistics
   */
  async getPortfolioSummary(positions: PositionData[]): Promise<PortfolioSummary> {
    try {
      console.log('Calculating portfolio summary for', positions.length, 'positions');

      if (positions.length === 0) {
        return this.getEmptyPortfolioSummary();
      }

      // Calculate totals
      const totalValueUSD = positions.reduce((sum, pos) => sum + pos.currentValueUSD, 0);
      const totalPnlUSD = positions.reduce((sum, pos) => sum + pos.pnlUSD, 0);
      const totalFeesUSD = positions.reduce((sum, pos) => sum + pos.totalFeesUSD, 0);
      const totalInitialUSD = positions.reduce((sum, pos) => sum + pos.initialValueUSD, 0);

      // Calculate percentages
      const totalPnlPercentage = totalInitialUSD > 0 ? (totalPnlUSD / totalInitialUSD) * 100 : 0;

      // Calculate weighted average APY
      const weightedAPY = positions.reduce((sum, pos) => {
        return sum + (pos.apy * pos.currentValueUSD);
      }, 0) / totalValueUSD;

      // Count positions
      const activePositions = positions.length;
      const inRangePositions = positions.filter(pos => pos.inRange).length;
      const outOfRangePositions = activePositions - inRangePositions;

      // Find top and worst performers
      const sortedByPnl = [...positions].sort((a, b) => b.pnlPercentage - a.pnlPercentage);
      const topPerformer = sortedByPnl[0]?.id || '';
      const worstPerformer = sortedByPnl[sortedByPnl.length - 1]?.id || '';

      // Calculate portfolio risk score
      const riskScore = this.calculatePortfolioRisk(positions);

      const summary: PortfolioSummary = {
        totalValueUSD,
        totalPnlUSD,
        totalPnlPercentage,
        totalFeesUSD,
        averageAPY: weightedAPY || 0,
        activePositions,
        inRangePositions,
        outOfRangePositions,
        riskScore,
        topPerformer,
        worstPerformer,
        metrics: {
          diversificationScore: this.calculateDiversificationScore(positions),
          averagePositionSize: totalValueUSD / activePositions,
          largestPositionSize: Math.max(...positions.map(pos => pos.currentValueUSD)),
          volatilityScore: this.calculateVolatilityScore(positions),
          uniqueTokens: this.countUniqueTokens(positions),
          portfolioAge: this.calculatePortfolioAge(positions),
        }
      };

      console.log('Portfolio summary calculated:', summary);
      return summary;

    } catch (error) {
      console.error('Error calculating portfolio summary:', error);
      return this.getEmptyPortfolioSummary();
    }
  }

  /**
   * Get token price from Jupiter API with caching
   * @param mint - Token mint address
   * @returns Token price in USD
   */
  private async getTokenPrice(mint: string): Promise<number> {
    try {
      // Check cache first
      const cached = this.priceCache.get(mint);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.price;
      }

      console.log('Fetching price for token:', mint);
      
      // Fetch from Jupiter API
      const response = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`);
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }

      const data = await response.json();
      const price = data.data?.[mint]?.price || 1.0;

      // Cache the result
      this.priceCache.set(mint, { price, timestamp: Date.now() });

      console.log(`Token ${mint} price: $${price}`);
      return price;

    } catch (error) {
      console.error('Error fetching token price:', error);
      return 1.0; // Fallback price
    }
  }

  /**
   * Get token metadata
   * @param mint - Token mint address
   * @returns Token metadata
   */
  private async getTokenMetadata(mint: string): Promise<{ symbol: string; name: string; decimals: number }> {
    // Simplified metadata - in reality, this would fetch from token registry
    const commonTokens: Record<string, { symbol: string; name: string; decimals: number }> = {
      'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana', decimals: 9 },
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    };

    return commonTokens[mint] || { symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 6 };
  }

  /**
   * Calculate APY for a position
   * @param position - Raw position data
   * @param feesUSD - Fees earned in USD
   * @param initialUSD - Initial investment in USD
   * @returns APY percentage
   */
  private async calculateAPY(position: any, feesUSD: number, initialUSD: number): Promise<number> {
    try {
      if (initialUSD <= 0) return 0;

      const createdAt = position.createdAt ? new Date(position.createdAt) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
      const now = new Date();
      const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceCreation <= 0) return 0;

      const dailyReturn = feesUSD / initialUSD / daysSinceCreation;
      const annualizedReturn = Math.pow(1 + dailyReturn, 365) - 1;
      const apy = Math.min(annualizedReturn * 100, 1000); // Cap at 1000%

      return Math.max(0, apy);

    } catch (error) {
      console.error('Error calculating APY:', error);
      return 0;
    }
  }

  /**
   * Calculate risk level for a position
   * @param lower - Lower price bound
   * @param upper - Upper price bound
   * @param current - Current price
   * @returns Risk level
   */
  private calculateRiskLevel(lower: number, upper: number, current: number): RiskLevel {
    try {
      const rangePercentage = (upper - lower) / lower;
      const distanceToLower = (current - lower) / lower;
      const distanceToUpper = (upper - current) / upper;
      const minDistance = Math.min(distanceToLower, distanceToUpper);

      // High risk: narrow range + near boundary
      if (rangePercentage < 0.05 && minDistance < 0.02) {
        return 'High';
      }

      // Medium risk: narrow range OR near boundary
      if (rangePercentage < 0.05 || minDistance < 0.05) {
        return 'Medium';
      }

      // Low risk: wide range + safe distance
      return 'Low';

    } catch (error) {
      console.error('Error calculating risk level:', error);
      return 'Medium';
    }
  }

  /**
   * Calculate portfolio risk score
   * @param positions - Array of positions
   * @returns Risk score (0-100)
   */
  private calculatePortfolioRisk(positions: PositionData[]): number {
    try {
      if (positions.length === 0) return 0;

      let riskScore = 0;

      // Concentration risk (positions too large relative to total)
      const totalValue = positions.reduce((sum, pos) => sum + pos.currentValueUSD, 0);
      const maxPositionValue = Math.max(...positions.map(pos => pos.currentValueUSD));
      const concentrationRisk = (maxPositionValue / totalValue) * 50; // Max 50 points

      // Out of range positions
      const outOfRangeCount = positions.filter(pos => !pos.inRange).length;
      const outOfRangeRisk = (outOfRangeCount / positions.length) * 30; // Max 30 points

      // Individual position risk levels
      const highRiskCount = positions.filter(pos => pos.riskLevel === 'High').length;
      const mediumRiskCount = positions.filter(pos => pos.riskLevel === 'Medium').length;
      const individualRisk = (highRiskCount * 10 + mediumRiskCount * 5) / positions.length; // Max 20 points

      riskScore = Math.min(100, concentrationRisk + outOfRangeRisk + individualRisk);

      return Math.round(riskScore);

    } catch (error) {
      console.error('Error calculating portfolio risk:', error);
      return 50; // Default medium risk
    }
  }

  /**
   * Calculate diversification score
   * @param positions - Array of positions
   * @returns Diversification score (0-100)
   */
  private calculateDiversificationScore(positions: PositionData[]): number {
    if (positions.length <= 1) return 0;

    const uniqueTokens = this.countUniqueTokens(positions);
    const positionCount = positions.length;
    
    // Higher score for more unique tokens and more positions
    const tokenScore = Math.min(50, uniqueTokens * 10);
    const positionScore = Math.min(50, positionCount * 5);
    
    return Math.min(100, tokenScore + positionScore);
  }

  /**
   * Count unique tokens in positions
   * @param positions - Array of positions
   * @returns Number of unique tokens
   */
  private countUniqueTokens(positions: PositionData[]): number {
    const tokens = new Set<string>();
    positions.forEach(pos => {
      tokens.add(pos.tokenXSymbol);
      tokens.add(pos.tokenYSymbol);
    });
    return tokens.size;
  }

  /**
   * Calculate volatility score
   * @param positions - Array of positions
   * @returns Volatility score (0-100)
   */
  private calculateVolatilityScore(positions: PositionData[]): number {
    if (positions.length <= 1) return 0;

    const pnlPercentages = positions.map(pos => pos.pnlPercentage);
    const mean = pnlPercentages.reduce((sum, val) => sum + val, 0) / pnlPercentages.length;
    const variance = pnlPercentages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pnlPercentages.length;
    const volatility = Math.sqrt(variance);

    // Convert to 0-100 scale (higher volatility = higher score)
    return Math.min(100, volatility * 2);
  }

  /**
   * Calculate portfolio age in days
   * @param positions - Array of positions
   * @returns Portfolio age in days
   */
  private calculatePortfolioAge(positions: PositionData[]): number {
    if (positions.length === 0) return 0;

    const oldestPosition = positions.reduce((oldest, pos) => {
      const posAge = pos.metadata?.createdAt || pos.lastUpdated;
      const oldestAge = oldest.metadata?.createdAt || oldest.lastUpdated;
      return posAge < oldestAge ? pos : oldest;
    });

    const now = new Date();
    const createdAt = oldestPosition.metadata?.createdAt || oldestPosition.lastUpdated;
    return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get empty portfolio summary
   * @returns Empty portfolio summary
   */
  private getEmptyPortfolioSummary(): PortfolioSummary {
    return {
      totalValueUSD: 0,
      totalPnlUSD: 0,
      totalPnlPercentage: 0,
      totalFeesUSD: 0,
      averageAPY: 0,
      activePositions: 0,
      inRangePositions: 0,
      outOfRangePositions: 0,
      riskScore: 0,
      topPerformer: '',
      worstPerformer: '',
      metrics: {
        diversificationScore: 0,
        averagePositionSize: 0,
        largestPositionSize: 0,
        volatilityScore: 0,
        uniqueTokens: 0,
        portfolioAge: 0,
      }
    };
  }

  /**
   * Get mock positions for demo purposes
   * @returns Array of mock position data
   */
  private getMockPositions(): PositionData[] {
    console.log('Generating mock positions for demo');
    
    return [
      {
        id: 'mock_pos_1',
        poolAddress: 'So11111111111111111111111111111111111111112',
        pairName: 'SOL-USDC',
        liquidity: 5000,
        currentValueUSD: 5250,
        initialValueUSD: 5000,
        totalFeesUSD: 125,
        pnlUSD: 375,
        pnlPercentage: 7.5,
        apy: 15.2,
        tokenXAmount: 10.5,
        tokenYAmount: 4200,
        tokenXSymbol: 'SOL',
        tokenYSymbol: 'USDC',
        priceRangeLower: 95,
        priceRangeUpper: 105,
        currentPrice: 100,
        inRange: true,
        riskLevel: 'Low',
        activeBins: 12,
        lastUpdated: new Date(),
        metadata: {
          feeTier: 0.01,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        }
      },
      {
        id: 'mock_pos_2',
        poolAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        pairName: 'USDC-USDT',
        liquidity: 2500,
        currentValueUSD: 2480,
        initialValueUSD: 2500,
        totalFeesUSD: 45,
        pnlUSD: 25,
        pnlPercentage: 1.0,
        apy: 8.5,
        tokenXAmount: 2480,
        tokenYAmount: 2480,
        tokenXSymbol: 'USDC',
        tokenYSymbol: 'USDT',
        priceRangeLower: 0.995,
        priceRangeUpper: 1.005,
        currentPrice: 1.002,
        inRange: true,
        riskLevel: 'Low',
        activeBins: 8,
        lastUpdated: new Date(),
        metadata: {
          feeTier: 0.005,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        }
      },
      {
        id: 'mock_pos_3',
        poolAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        pairName: 'SOL-USDT',
        liquidity: 3000,
        currentValueUSD: 2850,
        initialValueUSD: 3000,
        totalFeesUSD: 60,
        pnlUSD: -90,
        pnlPercentage: -3.0,
        apy: 5.2,
        tokenXAmount: 8.5,
        tokenYAmount: 2850,
        tokenXSymbol: 'SOL',
        tokenYSymbol: 'USDT',
        priceRangeLower: 110,
        priceRangeUpper: 120,
        currentPrice: 105,
        inRange: false,
        riskLevel: 'High',
        activeBins: 5,
        lastUpdated: new Date(),
        metadata: {
          feeTier: 0.02,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        }
      }
    ];
  }
}

export default SarosDLMMService;
