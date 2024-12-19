'use client'

import {
  Container,
  Flex,
  Text,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  Image,
  SimpleGrid,
  Box,
} from '@chakra-ui/react'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, formatEther } from 'ethers'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConfigData {
  general: {
    project: string
    version: string
    http_port: string
  }
  networks: {
    [key: string]: {
      networkName: string
      networkLongName: string
      symbol: string
      chainId: number
      testnet: boolean
      RPC_URLs: Array<{
        rpcurl: string
        type: string
        apikey: string
      }>
    }
  }
  listeningNetwork: {
    activeNativeToken: boolean
    networkName: string
    networkLongName: string
    symbol: string
    testnet: boolean
    chainId: number
    RPC_URLs: Array<{
      rpcurl: string
      type: string
      apikey: string
    }>
    nativeTokens: Array<{
      activated: boolean
      listeningAddress: string
      gasCostOnRefund: boolean
      minNoRefund: string
      min: string
      max: string
      fixedFees: string
      feesPcent: number
      conversionRateBC1toBC2: number
      calcGasCostOnBC2: boolean
      toNetwork: string
      toNetworkChainId: number
      toPublicKey: string
      publicKey4refund: string
    }>
  }
  tokensList: Array<{
    activated: boolean
    listeningAddress: string
    tokenContractAddress: string
    tokenName: string
    gasCostOnRefund: boolean
    minNoRefund: string
    min: string
    max: string
    fixedFees: string
    feesPcent: number
    conversionRateBC1toBC2: number
    conversionRateBC1toTokenBC1: number
    toNetwork: string
    toNetworkChainId: number
    toTokenContractAddress: string
    toToken: string
    calcGasCostOnBC2: boolean
    conversionRateTokenBC1toTokenBC2: number
    toPublicKey: string
    publicKey4refund: string
    listeningBalance: string
    tokenDecimals: number
    toNativeBalance: string
    toTokenBalance: string
    toTokenDecimals: number
  }>
}

export default function Home() {
  const [config, setConfig] = useState<ConfigData[]>([])

  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider('eip155')
  const router = useRouter()

  useEffect(() => {}, [])

  return (
    <Container maxW="container.sm" py={20}>
      <Text>Yo</Text>
    </Container>
  )
}
