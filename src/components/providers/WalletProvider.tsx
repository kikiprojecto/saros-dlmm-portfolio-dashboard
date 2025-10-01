'use client';

/**
 * Solana Wallet Provider Component
 * Provides wallet context and connection for the entire application
 */

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter styles
require('@solana/wallet-adapter-react-ui/styles.css');

interface AppWalletProviderProps {
  children: React.ReactNode;
}

/**
 * Wallet Provider Component
 * Sets up Solana wallet context with supported wallets and network configuration
 */
export default function AppWalletProvider({ children }: AppWalletProviderProps) {
  // Set network to mainnet for production
  const network = WalletAdapterNetwork.Mainnet;

  // Get RPC endpoint from environment or use default
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl(network);
  }, [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  console.log('Initializing wallet provider with endpoint:', endpoint);
  console.log('Supported wallets:', wallets.map(w => w.name));

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={true}
        onError={(error) => {
          console.error('Wallet error:', error);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
