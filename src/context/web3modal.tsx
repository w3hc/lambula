'use client'
import React, { ReactNode, createContext, useContext } from 'react'
import { createAppKit, useAppKitProvider } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import {
  sepolia,
  optimism,
  zksync,
  base,
  arbitrum,
  gnosis,
  polygon,
  polygonZkEvm,
  mantle,
  celo,
  avalanche,
  degen,
} from '@reown/appkit/networks'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

const metadata = {
  name: 'Lambula',
  description: 'Bridge your on-chain assets in seconds',
  url: 'https://lambula.netlify.app',
  icons: ['./favicon.ico'],
}

// Define the chain namespace type
type ChainNamespace = 'eip155' | 'solana' | 'cosmos' // Add other namespaces if needed

createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [sepolia, optimism, zksync, base, arbitrum, gnosis, polygon, polygonZkEvm, mantle, celo, avalanche, degen],
  defaultNetwork: sepolia,
  projectId,
  features: {
    email: true,
    socials: ['google', 'farcaster', 'github'],
  },
})

const AppKitContext = createContext<ReturnType<typeof useAppKitProvider> | null>(null)

export function Web3Modal({ children }: { children: ReactNode }) {
  // Use 'eip155' as the chain namespace for Ethereum-compatible chains
  const appKitProvider = useAppKitProvider('eip155')

  return <AppKitContext.Provider value={appKitProvider}>{children}</AppKitContext.Provider>
}

export function useAppKit() {
  const context = useContext(AppKitContext)
  if (!context) {
    throw new Error('useAppKit must be used within a Web3Modal')
  }
  return context
}
