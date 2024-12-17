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

export default function Home() {
  const seoTitle = 'Lambula - Bridge your assets in seconds'
  const seoDescription =
    'An on-chain asset bridge for converting ERC-20 tokens between EVM-compatible blockchains without smart contracts or interfaces.'

  interface Tokens {
    ticker: string
    available: boolean
    min: number
    max: number
    fixedFees: string
    feesPcent: number
    bridgeOperatorOpAddress: string
    tokenSepoliaAddress: string
    tokenOptimismAddress: string
    conversionRateTokenBC1toTokenBC2: number
  }

  interface Networks {
    name: string
    availableDestinations: string[]
    enabled: boolean
  }

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [txLink, setTxLink] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [balance, setBalance] = useState<string>('0')
  const [network, setNetwork] = useState<string>('Unknown')
  const [swapAmount, setSwapAmount] = useState<string>('0.0005')
  const [availableBalance, setAvailableBalance] = useState<number | null>(200)
  const [selectedToken, setSelectedToken] = useState<string>('ETH')
  const [isFirstClick, setIsFirstClick] = useState(false)
  const [sourceNetwork, setSourceNetwork] = useState('Sepolia')
  const [destinationNetwork, setDestinationNetwork] = useState('OP Sepolia')
  const [totalFees, setTotalFees] = useState<number | null>(200)
  const [quote, setQuote] = useState<number | null>(200)
  const [step, setStep] = useState<number | null>(0)

  const [tokens, setTokens] = useState<Tokens[]>([
    {
      ticker: 'LINK',
      available: true,
      min: 0,
      max: 200,
      fixedFees: '0.1',
      feesPcent: 0.01,
      bridgeOperatorOpAddress: '',
      tokenSepoliaAddress: '',
      tokenOptimismAddress: '',
      conversionRateTokenBC1toTokenBC2: 1,
    },
    // {
    //   ticker: 'BASIC',
    //   available: false,
    //   min: 100,
    //   max: 10000,
    //   fixedFees: '0.1',
    //   feesPcent: 0.01,
    //   bridgeOperatorOpAddress: '',
    //   tokenSepoliaAddress: '',
    //   tokenOptimismAddress: '',
    //   conversionRateTokenBC1toTokenBC2: 1,
    // },
    {
      ticker: 'ETH',
      available: true,
      min: 0.01,
      max: 10,
      fixedFees: '0.1',
      feesPcent: 0.01,
      bridgeOperatorOpAddress: '',
      tokenSepoliaAddress: '',
      tokenOptimismAddress: '',
      conversionRateTokenBC1toTokenBC2: 1,
    },
  ])
  const [networks, setNetworks] = useState<Networks[]>([
    {
      name: 'Sepolia',
      // availableDestinations: ['OP Sepolia', 'Base Sepolia', 'Arbitrum Sepolia'],
      availableDestinations: ['OP Sepolia'],
      enabled: true,
    },
    {
      name: 'OP Sepolia',
      availableDestinations: ['Base Sepolia', 'Arbitrum Sepolia'],
      enabled: false,
    },
    {
      name: 'Base Sepolia',
      availableDestinations: ['Sepolia'],
      enabled: false,
    },
    {
      name: 'Arbitrum Sepolia',
      availableDestinations: ['Sepolia'],
      enabled: false,
    },
  ])

  const getAvailableDestinations = (source: any) => {
    const network = networks.find((n) => n.name === source)
    return network ? network.availableDestinations : []
  }

  const { address, isConnected, caipAddress } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const toast = useToast()

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms * 1000))

  useEffect(() => {
    const init = async () => {
      if (!isConnected) return
      try {
        const deamonEndpointUrl = 'http://91.169.206.199:997/json'
        // const deamonEndpointUrl = 'http://localhost:3001/json'

        // test env
        const res = await fetch(deamonEndpointUrl)

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        // fake data
        // const res = await fetch(`${baseUrl}/config.json`)

        const data = await res.json()
        console.log(
          'data.listeningNetwork.nativeTokens[0].listeningAddress:',
          data.listeningNetwork.nativeTokens[0].listeningAddress
        ),
          console.log('JSON data:', data)

        /* 

        "tokensList": [

        "listeningAddress": "0x962aC815B1249027Cfd80D6b0476C9090B5aeF39",
        "tokenContractAddress": "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        "toNetwork": "Optimism Sepolia",
        "toTokenContractAddress": "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",

        */

        // format tokens

        setTokens([
          {
            ticker: 'LINK',
            available: true,
            min: data.tokensList[0].min,
            max: data.tokensList[0].max,
            fixedFees: Number(data.tokensList[0].fixedFees).toFixed(6),
            feesPcent: data.tokensList[0].feesPcent,
            bridgeOperatorOpAddress: data.tokensList[0].listeningAddress,
            tokenSepoliaAddress: data.tokensList[0].tokenContractAddress,
            tokenOptimismAddress: data.tokensList[0].toTokenContractAddress,
            conversionRateTokenBC1toTokenBC2: data.tokensList[0].conversionRateTokenBC1toTokenBC2,
          },
          // {
          //   ticker: 'BASIC',
          //   available: false,
          //   min: 100,
          //   max: 10000,
          //   fixedFees: '0.1',
          //   feesPcent: 0.01,
          //   bridgeOperatorOpAddress: '',
          //   tokenSepoliaAddress: '',
          //   tokenOptimismAddress: '',
          //   conversionRateTokenBC1toTokenBC2: 1,
          // },
          {
            ticker: 'ETH',
            available: data.listeningNetwork.nativeTokens[0].activated,
            min: data.listeningNetwork.nativeTokens[0].min,
            max: data.listeningNetwork.nativeTokens[0].max,
            fixedFees: Number(data.listeningNetwork.nativeTokens[0].fixedFees).toFixed(6),
            feesPcent: data.listeningNetwork.nativeTokens[0].feesPcent,
            bridgeOperatorOpAddress: data.listeningNetwork.nativeTokens[0].listeningAddress,
            tokenSepoliaAddress: '0x',
            tokenOptimismAddress: '0x',
            conversionRateTokenBC1toTokenBC2: data.listeningNetwork.nativeTokens[0].conversionRateBC1toBC2,
          },
        ])
        // format networks
        setNetworks([
          {
            name: 'Sepolia',
            // availableDestinations: ['OP Sepolia', 'Base Sepolia', 'Arbitrum Sepolia'],
            availableDestinations: ['OP Sepolia'],
            enabled: true,
          },
          {
            name: 'OP Sepolia',
            availableDestinations: ['Base Sepolia', 'Arbitrum Sepolia'],
            enabled: false,
          },
          {
            name: 'Base Sepolia',
            availableDestinations: ['Sepolia'],
            enabled: false,
          },
          {
            name: 'Arbitrum Sepolia',
            availableDestinations: ['Sepolia'],
            enabled: false,
          },
        ])
        await getNetwork()
        await getBal()
        console.log('user address:', address)
        console.log('erc20 contract address:', ERC20_CONTRACT_ADDRESS)
      } catch (err) {
        console.error('Error fetching data:', err)
        toast({
          title: 'Error fetching deamon data',
          description: 'It seems like the deamon is not responding right now. Sorry for the inconvenience.',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
      }
      setQuote(parseFloat(swapAmount) - (parseFloat(swapAmount) * 0.01 + parseFloat('0.1')))
      setTotalFees(parseFloat(swapAmount) * 0.01 + parseFloat('0.1'))
    }
    init()
  }, [isConnected, address, caipAddress])

  const getBal = async () => {
    if (isConnected && walletProvider) {
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const balance = await ethersProvider.getBalance(address as any)

      const ethBalance = ethers.formatEther(balance)
      console.log('bal:', Number(parseFloat(ethBalance).toFixed(5)))
      setBalance(parseFloat(ethBalance).toFixed(5))
      if (ethBalance !== '0') {
        return Number(ethBalance)
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  const getNetwork = async () => {
    if (walletProvider) {
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const network = await ethersProvider.getNetwork()
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
      setNetwork(capitalize(network.name))
    }
  }

  const openEtherscan = () => {
    if (address) {
      const baseUrl =
        caipAddress === 'eip155:11155111:' ? 'https://sepolia.etherscan.io/address/' : 'https://etherscan.io/address/'
      window.open(baseUrl + address, '_blank')
    }
  }

  const faucetTx = async () => {
    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Faucet request failed')
      }
      return data.txHash
    } catch (error) {
      console.error('Faucet error:', error)
      throw error
    }
  }

  const send = async () => {
    setStep(0)
    setTxHash(undefined)
    try {
      if (!isConnected) {
        toast({
          title: 'Not connected yet',
          description: 'Please connect your wallet, my friend.',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
        return
      }
      if (walletProvider) {
        setIsLoading(true)
        setTxHash('')
        setTxLink('')
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider)
        const signer = await ethersProvider.getSigner()

        ///// Send ETH if needed /////
        // const bal = await getBal()
        // console.log('bal:', bal)
        // if (bal < 0.025) {
        //   const faucetTxHash = await faucetTx()
        //   console.log('faucet tx:', faucetTxHash)
        //   const bal = await getBal()
        //   console.log('bal:', bal)
        // }

        ///// Call /////
        // const erc20 = new Contract(tokens[0].tokenSepoliaAddress, ERC20_CONTRACT_ABI, signer) // TODO: adjust token index ([0])

        ///// Token call /////
        // const amount = parseEther(swapAmount)
        // const to = tokens[0].bridgeOperatorOpAddress
        // const call = await erc20.transfer(to, amount)

        ///// ETH call /////
        const amount = parseEther(swapAmount)
        console.log('amount:', amount)
        const to = tokens[1].bridgeOperatorOpAddress
        console.log('bridge address:', to)

        const call = await signer.sendTransaction({
          to,
          value: amount,
        })

        let receipt: any
        try {
          receipt = await call.wait()
        } catch (error) {
          console.error('Error waiting for transaction:', error)
          throw new Error('Transaction failed or was reverted')
        }

        if (receipt === null) {
          throw new Error('Transaction receipt is null')
        }

        console.log('tx:', receipt)
        setTxHash(receipt.hash)
        setTxLink('https://sepolia.etherscan.io/tx/' + receipt.hash)
        setIsLoading(false)
        toast({
          title: 'Successful tx',
          description: 'Well done! 🎉',
          status: 'success',
          position: 'bottom',
          variant: 'subtle',
          duration: 20000,
          isClosable: true,
        })
        await getBal()
        setStep(1)
      }
      await delay(5) // TODO: check tx status on OP Sepolia // "rpcurl": "https://sepolia.optimism.io",

      /** 

  FAIRE 2 FONCTIONS : 1 token, 1 natif

      let new_signer_receive_balance = 0
      let i = 0
      while (true) {
        await sleep(waitingTime)
        new_signer_receive_balance = await providerReceive.getBalance(signerSender.address)
        if (!new_signer_receive_balance.eq(signer_receive_balance)) break
        new_signer_balance = await providerSend.getBalance(signerSender.address)
        if (new_signer_balance.eq(signer_balance)) break
        i++
        if (i > maxTime) break
      }

      **/

      setStep(2)
      await delay(5)
      setStep(3)
    } catch (e) {
      setIsLoading(false)
      console.error('Error in send:', e)
      toast({
        title: 'Woops',
        description: e instanceof Error ? e.message : 'Something went wrong...',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  const handleSwapAmountChange = (valueString: string) => {
    setSwapAmount(valueString)
    const value = parseFloat(valueString)
    const selectedTokenData = tokens.find((t) => t.ticker === selectedToken)

    if (!selectedTokenData || isNaN(value)) return

    // if (value < selectedTokenData.min) {
    //   setTimeout(() => setSwapAmount(selectedTokenData.min.toFixed(6)), 1000)
    // } else if (value > selectedTokenData.max) {
    //   setTimeout(() => setSwapAmount(selectedTokenData.max.toFixed(6)), 1000)
    // }

    const fees = value * selectedTokenData.feesPcent + parseFloat(selectedTokenData.fixedFees)

    setTotalFees(Number(fees.toFixed(4)))
    setQuote(Number(((value - fees) * selectedTokenData.conversionRateTokenBC1toTokenBC2).toFixed(4)))
    // TODO: adjust token index / token address
  }

  const isAmountExceedingBalance = () => {
    if (availableBalance === null) return false
    const amount = parseFloat(swapAmount)
    return amount > availableBalance
  }

  const handleClick = () => {
    if (!isFirstClick) {
      setIsFirstClick(true)
      setTimeout(() => setIsFirstClick(false), 10000)
    } else {
      setIsFirstClick(false)
      send()
    }
  }

  return (
    <>
      <NextSeo
        title={seoTitle}
        titleTemplate="%s"
        description={seoDescription}
        canonical={SITE_URL}
        openGraph={{
          type: 'website',
          url: SITE_URL,
          title: seoTitle,
          description: seoDescription,
          site_name: 'Lambula',
          images: [
            {
              url: `${SITE_URL}/huangshan.png`,
              width: 1200,
              height: 630,
              alt: 'Lambula - Bridge your assets in seconds',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
          site: '@w3hc8',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'web3, ethereum, blockchain, dapp, onchain, bridge, swap, erc20 ',
          },
          {
            name: 'author',
            content: 'W3HC',
          },
        ]}
      />
      <Head title={SITE_NAME} description={SITE_DESCRIPTION} />
      <main>
        <>
          <Flex gap={4} align="center" mt={20} mb={8}>
            <Select value={sourceNetwork} onChange={(e) => setSourceNetwork(e.target.value)}>
              {networks.map((network) => (
                <option key={network.name} value={network.name} disabled={!network.enabled}>
                  {network.name}
                </option>
              ))}
            </Select>
            <Text mx={2}>→</Text>
            <Select value={destinationNetwork} onChange={(e) => setDestinationNetwork(e.target.value)}>
              {networks.map((network) => (
                <option
                  key={network.name}
                  value={network.name}
                  disabled={!getAvailableDestinations(sourceNetwork).includes(network.name)}>
                  {network.name}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex gap={4} align="center" mt={3}>
            <NumberInput
              value={swapAmount}
              onChange={(value: string) => handleSwapAmountChange(value)}
              min={tokens.find((t) => t.ticker === selectedToken)?.min || 1}
              max={tokens.find((t) => t.ticker === selectedToken)?.max || 200}
              step={selectedToken === 'ETH' ? 0.01 : 1}
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
              {tokens.map((token) => (
                <option key={token.ticker} value={token.ticker} disabled={!token.available}>
                  {token.ticker}
                </option>
              ))}
            </Select>
          </Flex>
          <br />
          <Box
            p={4}
            borderWidth="4px"
            borderStyle="solid"
            borderColor="#8c1c84"
            borderRadius="lg"
            my={2}
            mb={3}
            cursor="pointer"
            transition="all 0.07s"
            style={{
              animation: isFirstClick ? 'blink 0.2s ease-in-out infinite' : 'none',
            }}
            sx={{
              '@keyframes blink': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.3 },
                '100%': { opacity: 1 },
              },
            }}
            onClick={handleClick}
            _hover={{
              borderColor: '#45a2f8',
              boxShadow: 'md',
              transform: 'scale(1.01)',
            }}>
            <Text>
              Send{' '}
              <strong>
                {!swapAmount ? 'your' : swapAmount} {selectedToken}
              </strong>{' '}
              on <strong>{sourceNetwork}</strong> and you will get <strong>{Number(quote).toFixed(4)}</strong>{' '}
              <strong>{selectedToken}</strong> on <strong>{destinationNetwork}</strong>.
            </Text>
          </Box>
          <Text fontSize="sm" color="gray.500">
            Gas fees are on us! but you will pay <strong>{Number(totalFees).toFixed(4)}</strong> {selectedToken} in
            service fees. It should take about <strong>3</strong> seconds.
          </Text>
        </>
        {step === 1 && <Text py={4}>Your tx on Sepolia went through ✅</Text>}{' '}
        {step === 2 && <Text py={4}>Tx on OP Sepolia is being confirmed…</Text>}{' '}
        {step === 3 && <Text py={4}>Tx on OP Sepolia confirmed ✅</Text>}{' '}
        {/* {txHash && isConnected && (
          <Text py={4} fontSize="14px" color="#45a2f8">
            <LinkComponent href={txLink ? txLink : ''}>{txHash}</LinkComponent>
          </Text>
        )}{' '} */}
      </main>
    </>
  )
}
