'use client';

/**
 * Main Portfolio Dashboard Component
 * Central UI component for the Saros DLMM Portfolio Analytics Dashboard
 */

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import useSarosDLMM from '@/hooks/useSarosDLMM';
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatDate,
  getRiskColor,
  getStatusColor,
  getPnlColor,
  getApyColor,
} from '@/utils/formatting';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Activity,
  RefreshCw,
  AlertTriangle,
  Target,
  Zap,
  BarChart3,
  Clock,
  Check,
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PositionData } from '@/types';
import { LucideIcon } from 'lucide-react';

/**
 * Metric Card Component
 * Displays a single metric with icon, value, and trend indicator
 */
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
  className?: string;
}

function MetricCard({ title, value, change, icon: Icon, trend, className = '' }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success-600 bg-success-100';
      case 'down':
        return 'text-danger-600 bg-danger-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={`card-hover p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${getTrendColor()}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== 'neutral' && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/**
 * Position Card Component
 * Displays individual position information with metrics and actions
 */
interface PositionCardProps {
  position: PositionData;
}

function PositionCard({ position }: PositionCardProps) {
  const isInRange = position.inRange;
  const pnlColor = getPnlColor(position.pnlUSD);
  const apyColor = getApyColor(position.apy);
  const riskColor = getRiskColor(position.riskLevel);
  const statusColor = getStatusColor(isInRange);

  // Calculate price range progress (0-100)
  const rangeProgress = position.priceRangeUpper > position.priceRangeLower 
    ? ((position.currentPrice - position.priceRangeLower) / (position.priceRangeUpper - position.priceRangeLower)) * 100
    : 50;

  return (
    <div className="card-hover p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{position.pairName}</h3>
          <p className="text-sm text-gray-500">Pool: {position.poolAddress.slice(0, 8)}...</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
            {position.riskLevel} Risk
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {isInRange ? (
              <span className="flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>In Range</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <X className="w-3 h-3" />
                <span>Out of Range</span>
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Current Value</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(position.currentValueUSD)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">P&L</p>
          <p className={`text-lg font-semibold ${pnlColor}`}>
            {formatCurrency(position.pnlUSD)} ({formatPercentage(position.pnlPercentage / 100)})
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">APY</p>
          <p className={`text-lg font-semibold ${apyColor}`}>
            {formatPercentage(position.apy / 100)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Fees Earned</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(position.totalFeesUSD)}
          </p>
        </div>
      </div>

      {/* Token Amounts */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-600 mb-3">Token Holdings</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">{position.tokenXSymbol}</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(position.tokenXAmount, 4)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">{position.tokenYSymbol}</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(position.tokenYAmount, 4)}
            </p>
          </div>
        </div>
      </div>

      {/* Price Range Visualization */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Price Range</span>
          <span>Current: {formatCurrency(position.currentPrice)}</span>
        </div>
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, rangeProgress))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatCurrency(position.priceRangeLower)}</span>
            <span>{formatCurrency(position.priceRangeUpper)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button className="btn-primary flex-1">
          Manage Position
        </button>
        <button className="btn-secondary">
          Details
        </button>
      </div>
    </div>
  );
}

/**
 * Main Portfolio Dashboard Component
 */
export default function PortfolioDashboard() {
  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'analytics'>('overview');

  // Hooks
  const { connected } = useWallet();
  const {
    positions,
    summary,
    loading,
    error,
    lastUpdate,
    refreshData,
    hasPositions,
    totalValue,
    totalPnL,
    totalPnLPercentage,
    inRangeCount,
    outOfRangeCount,
    averageAPY,
    riskScore,
  } = useSarosDLMM();

  // Handle refresh
  const handleRefresh = async () => {
    await refreshData();
  };

  // Not connected state
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-strong p-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-primary-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              DLMM Portfolio Dashboard
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Connect your wallet to view and manage your Saros DLMM liquidity positions. 
              Track performance, analyze returns, and optimize your DeFi portfolio.
            </p>
            
            <WalletMultiButton className="wallet-adapter-button-trigger" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                DLMM Portfolio Dashboard
              </h1>
              {lastUpdate && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDate(lastUpdate)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <WalletMultiButton className="wallet-adapter-button" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-danger-600" />
            <div>
              <p className="text-sm font-medium text-danger-800">Error loading portfolio data</p>
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && !summary && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading portfolio data...</p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {summary && (
          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'positions', label: 'Positions', icon: Target },
                { id: 'analytics', label: 'Analytics', icon: Activity },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Portfolio Value"
                    value={formatCurrency(summary.totalValueUSD)}
                    change="+5.2%"
                    icon={DollarSign}
                    trend="up"
                  />
                  <MetricCard
                    title="Total P&L"
                    value={formatCurrency(summary.totalPnlUSD)}
                    change={formatPercentage(summary.totalPnlPercentage / 100)}
                    icon={TrendingUp}
                    trend={summary.totalPnlUSD >= 0 ? "up" : "down"}
                  />
                  <MetricCard
                    title="Fees Earned"
                    value={formatCurrency(summary.totalFeesUSD)}
                    change="+12.4%"
                    icon={Zap}
                    trend="up"
                  />
                  <MetricCard
                    title="Average APY"
                    value={`${summary.averageAPY.toFixed(2)}%`}
                    change="+2.1%"
                    icon={Percent}
                    trend="up"
                  />
                </div>

                {/* Performance Chart Section */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Portfolio Performance</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { date: '2024-01', value: summary.totalValueUSD * 0.7 },
                          { date: '2024-02', value: summary.totalValueUSD * 0.8 },
                          { date: '2024-03', value: summary.totalValueUSD * 0.85 },
                          { date: '2024-04', value: summary.totalValueUSD * 0.9 },
                          { date: '2024-05', value: summary.totalValueUSD * 0.95 },
                          { date: '2024-06', value: summary.totalValueUSD },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#portfolioGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Active Positions Card */}
                  <div className="card p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary-100 rounded-full">
                        <Target className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Positions</p>
                        <p className="text-3xl font-bold text-gray-900">{summary.activePositions}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1 text-success-600">
                        <Check className="w-4 h-4" />
                        <span>{summary.inRangePositions} in range</span>
                      </span>
                      <span className="flex items-center space-x-1 text-danger-600">
                        <X className="w-4 h-4" />
                        <span>{summary.outOfRangePositions} out of range</span>
                      </span>
                    </div>
                  </div>

                  {/* Risk Score Card */}
                  <div className="card p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        summary.riskScore < 30 ? 'bg-success-100' :
                        summary.riskScore < 70 ? 'bg-warning-100' : 'bg-danger-100'
                      }`}>
                        <AlertTriangle className={`w-6 h-6 ${
                          summary.riskScore < 30 ? 'text-success-600' :
                          summary.riskScore < 70 ? 'text-warning-600' : 'text-danger-600'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Risk Score</p>
                        <p className="text-3xl font-bold text-gray-900">{summary.riskScore.toFixed(0)}/100</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            summary.riskScore < 30 ? 'bg-success-500' :
                            summary.riskScore < 70 ? 'bg-warning-500' : 'bg-danger-500'
                          }`}
                          style={{ width: `${summary.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Performer Card */}
                  <div className="card p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-success-100 rounded-full">
                        <BarChart3 className="w-6 h-6 text-success-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Top Performer</p>
                        <p className="text-lg font-semibold text-success-600">
                          {summary.topPerformer || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">Best performing pair</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Positions Grid */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Positions</h2>
                    <p className="text-gray-500">{positions.length} total positions</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {positions.map((position) => (
                      <PositionCard key={position.id} position={position} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'positions' && (
              <div className="space-y-6">
                {/* Positions Management View */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Position Management</h2>
                  <div className="flex space-x-3">
                    <button className="btn-secondary">Filter</button>
                    <button className="btn-secondary">Sort</button>
                    <button className="btn-primary">Add Position</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {positions.map((position) => (
                    <PositionCard key={position.id} position={position} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Analytics View */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Portfolio Analytics</h2>
                  <div className="flex space-x-3">
                    <button className="btn-secondary">Export Data</button>
                    <button className="btn-primary">Generate Report</button>
                  </div>
                </div>

                {/* Analytics Charts and Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { date: 'Week 1', value: summary.totalValueUSD * 0.8 },
                            { date: 'Week 2', value: summary.totalValueUSD * 0.85 },
                            { date: 'Week 3', value: summary.totalValueUSD * 0.9 },
                            { date: 'Week 4', value: summary.totalValueUSD },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
                    <div className="space-y-4">
                      {['Low', 'Medium', 'High'].map((risk) => {
                        const count = positions.filter(p => p.riskLevel === risk).length;
                        const percentage = positions.length > 0 ? (count / positions.length) * 100 : 0;
                        return (
                          <div key={risk} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">{risk} Risk</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    risk === 'Low' ? 'bg-success-500' :
                                    risk === 'Medium' ? 'bg-warning-500' : 'bg-danger-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
