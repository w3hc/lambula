import * as React from 'react'
import {
  Text,
  useToast,
  Box,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Select,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { BrowserProvider, Contract, Eip1193Provider, parseEther } from 'ethers'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { ERC20_CONTRACT_ADDRESS, ERC20_CONTRACT_ABI } from '../utils/erc20'
import { LinkComponent } from '../components/LinkComponent'
import { ethers } from 'ethers'
import { Head } from '../components/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import { NextSeo } from 'next-seo'
import { SITE_URL } from '../utils/config'

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
  const seoTitle = 'Lambula - Bridge your assets in seconds'
  const seoDescription =
    'An on-chain asset bridge for converting ERC-20 tokens between EVM-compatible blockchains without smart contracts or interfaces.'

  const toast = useToast()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')

  const [config, setConfig] = useState<ConfigData[]>([])
  const [sourceNetwork, setSourceNetwork] = useState('')
  const [destinationNetwork, setDestinationNetwork] = useState('')
  const [selectedToken, setSelectedToken] = useState('')
  const [swapAmount, setSwapAmount] = useState('0.001') // Set default amount to 0.001
  const [isLoading, setIsLoading] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  // Get available networks from config
  const networks = [config[0]?.listeningNetwork, ...Object.values(config[0]?.networks || {})].filter(Boolean)

  // Get available tokens from config
  const tokens = config[0]?.tokensList || []

  // Get available destinations based on tokens configuration
  const getAvailableDestinations = (source: string) => {
    if (!source) return []
    return tokens.filter((token) => token.activated).map((token) => token.toNetwork)
  }

  // Handle swap amount change with validation
  const handleSwapAmountChange = (value: string) => {
    setSwapAmount(value)
  }

  // Check if amount exceeds balance
  const isAmountExceedingBalance = () => {
    const token = tokens.find((t) => t.tokenName === selectedToken)
    if (!token) return false
    return Number(swapAmount) > Number(token.listeningBalance)
  }

  // Get min value for selected token
  const getMinValue = (): number => {
    const token = tokens.find((t) => t.tokenName === selectedToken)
    return token ? Number(token.min) : 0
  }

  // Get max value for selected token
  const getMaxValue = (): number => {
    const token = tokens.find((t) => t.tokenName === selectedToken)
    return token ? Number(token.max) : 0
  }

  // Handle token swap
  const handleSwap = async () => {
    if (!isConnected) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    const token = tokens.find((t) => t.tokenName === selectedToken)
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invalid token selected',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      setIsLoading(true)
      const provider = new BrowserProvider(walletProvider as Eip1193Provider)
      const signer = await provider.getSigner()
      const contract = new Contract(token.tokenContractAddress, ERC20_CONTRACT_ABI, signer)

      // Handle the swap transaction
      const tx = await contract.transfer(token.toPublicKey, parseEther(swapAmount))
      await tx.wait()

      toast({
        title: 'Success',
        description: 'Swap completed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Swap error:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete swap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const validateNetwork = async () => {
      if (!config[0]?.listeningNetwork?.RPC_URLs?.[0]?.rpcurl) {
        setNetworkError('No RPC URL configured')
        return
      }

      try {
        const provider = new ethers.JsonRpcProvider(config[0].listeningNetwork.RPC_URLs[0].rpcurl)
        await provider.getNetwork()
        setNetworkError(null)
      } catch (error) {
        console.error('Network validation error:', error)
        setNetworkError('Failed to connect to network')
        toast({
          title: 'Network Error',
          description: 'Failed to connect to the network. Please check your RPC configuration.',
          status: 'error',
          duration: null,
          isClosable: true,
        })
      }
    }

    const fetchConfig = async () => {
      try {
        const response = await fetch('/config.json')
        const data = await response.json()
        setConfig(data)

        // Validate network connection after config is loaded
        await validateNetwork()

        // Set initial values
        if (data[0]?.listeningNetwork) {
          setSourceNetwork(data[0].listeningNetwork.networkName)
          const firstAvailableDestination = data[0].tokensList?.find((token: any) => token.activated)?.toNetwork
          if (firstAvailableDestination) {
            setDestinationNetwork(firstAvailableDestination)
          }
        }

        if (data[0]?.tokensList) {
          const firstActiveToken = data[0].tokensList.find((token: any) => token.activated)
          if (firstActiveToken) {
            setSelectedToken(firstActiveToken.tokenName)
          }
        }
      } catch (error) {
        console.error('Error fetching config:', error)
        toast({
          title: 'Error',
          description: 'Failed to load configuration',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }

    fetchConfig()
  }, [toast])

  const availableNetworks = networks.filter((network) => {
    if (network === config[0]?.listeningNetwork) return true
    return tokens.some((token) => token.activated && token.toNetwork === network.networkName)
  })

  return (
    <>
      <Head title={seoTitle} description={seoDescription} />
      <NextSeo title={seoTitle} description={seoDescription} openGraph={{ url: SITE_URL }} />

      <Box>
        {networkError && (
          <Box bg="red.100" color="red.800" p={4} mb={4} borderRadius="md">
            <Text>{networkError}</Text>
            <Text fontSize="sm">Please check your network configuration and RPC endpoints.</Text>
          </Box>
        )}
        <>
          <Flex gap={4} align="center" mt={20} mb={8}>
            <Select value={sourceNetwork} onChange={(e) => setSourceNetwork(e.target.value)}>
              {availableNetworks.map((network) => (
                <option key={network.networkName} value={network.networkName}>
                  {network.networkLongName}
                </option>
              ))}
            </Select>
            <Text mx={2}>→</Text>
            <Select value={destinationNetwork} onChange={(e) => setDestinationNetwork(e.target.value)}>
              {availableNetworks.map((network) => (
                <option
                  key={network.networkName}
                  value={network.networkName}
                  disabled={!getAvailableDestinations(sourceNetwork).includes(network.networkName)}>
                  {network.networkLongName}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex gap={4} align="center" mt={3}>
            <NumberInput
              defaultValue={0.001}
              value={swapAmount}
              onChange={handleSwapAmountChange}
              min={getMinValue()}
              max={getMaxValue()}
              step={0.0001}
              flex={1}>
              <NumberInputField
                borderColor={isAmountExceedingBalance() ? 'red.500' : undefined}
                _hover={{ borderColor: isAmountExceedingBalance() ? 'red.600' : undefined }}
                _focus={{ borderColor: isAmountExceedingBalance() ? 'red.600' : undefined }}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <Select maxWidth="150px" value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)}>
              {tokens
                .filter((token) => token.activated)
                .map((token) => (
                  <option key={token.tokenName} value={token.tokenName}>
                    {token.tokenName}
                  </option>
                ))}
            </Select>
          </Flex>
        </>
      </Box>
    </>
  )
}
