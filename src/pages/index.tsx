import * as React from 'react'
import {
  Text,
  Button,
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

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [txLink, setTxLink] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [balance, setBalance] = useState<string>('0')
  const [network, setNetwork] = useState<string>('Unknown')
  const [swapAmount, setSwapAmount] = useState<string>('8')
  const [availableBalance, setAvailableBalance] = useState<number | null>(200)
  const [selectedToken, setSelectedToken] = useState<string>('LINK')
  const [isFirstClick, setIsFirstClick] = useState(false)

  const { address, isConnected, caipAddress } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  // const { walletInfo } = useWalletInfo()
  const toast = useToast()

  useEffect(() => {
    if (isConnected) {
      setTxHash(undefined)
      getNetwork()
      // updateLoginType()
      getBal()
      console.log('user address:', address)
      console.log('erc20  contract address:', ERC20_CONTRACT_ADDRESS)
      // console.log('walletInfo:', walletInfo)
    }
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

  // const updateLoginType = async () => {
  //   try {
  //     if (walletInfo != undefined) {
  //       setLoginType(walletInfo.name ? walletInfo.name : 'Unknown')
  //     }
  //   } catch (error) {
  //     console.error('Error getting login type:', error)
  //     setLoginType('Unknown')
  //   }
  // }

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

  const doSomething = async () => {
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

        const erc20 = new Contract(ERC20_CONTRACT_ADDRESS, ERC20_CONTRACT_ABI, signer)

        ///// Send ETH if needed /////
        const bal = await getBal()
        console.log('bal:', bal)
        if (bal < 0.025) {
          const faucetTxHash = await faucetTx()
          console.log('faucet tx:', faucetTxHash)
          const bal = await getBal()
          console.log('bal:', bal)
        }
        ///// Call /////
        const call = await erc20.mint(parseEther('10000')) // 0.000804454399826656 ETH // https://sepolia.etherscan.io/tx/0x687e32332965aa451abe45f89c9fefc4b5afe6e99c95948a300565f16a212d7b

        let receipt: ethers.ContractTransactionReceipt | null = null
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
      }
    } catch (e) {
      setIsLoading(false)
      console.error('Error in doSomething:', e)
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
      doSomething()
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
        {!isConnected ? (
          <>
            <Text>Please connect your wallet.</Text>
            <br />
          </>
        ) : (
          <>
            <Flex gap={4} align="center" mt={20}>
              <NumberInput value={swapAmount} onChange={handleSwapAmountChange} min={1} max={10000} step={1} flex={1}>
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
                {' '}
                <option value="LINK">LINK</option>
                <option value="BASIC">BASIC</option>
                <option value="ETH">ETH</option>
              </Select>
            </Flex>
            <br />
            <Box
              p={4}
              borderWidth="3px"
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
              // animation={isFirstClick ? `${blinkAnimation} 0.5s ease-in-out infinite` : 'none'}
              onClick={handleClick}
              _hover={{
                borderColor: '#45a2f8',
                boxShadow: 'md',
                transform: 'scale(1.01)',
              }}>
              {/* <Text>
              Network: <strong>{network}</strong>
            </Text>
            {/* <Text>
              Login type: <strong>{loginType}</strong>
            </Text>
            <Text>
              Balance: <strong>{balance} ETH</strong>
            </Text>
            <Text>
              Address: <strong>{address || 'Not connected'}</strong>
            </Text> */}
              <Text>
                Bridge{' '}
                <strong>
                  {!swapAmount ? 'your' : swapAmount} {selectedToken}
                </strong>{' '}
                from <strong>Sepolia</strong> to <strong>OP Sepolia</strong>.
              </Text>
            </Box>
            <Text fontSize="sm" color="gray.500">
              You will pay <strong>0.10</strong> EUR and it will take <strong>3</strong> seconds.
            </Text>
          </>
        )}
        {/* <Button
          colorScheme="blue"
          variant="outline"
          type="submit"
          onClick={doSomething}
          isLoading={isLoading}
          loadingText="Minting..."
          spinnerPlacement="end">
          Bridge
        </Button> */}
        {txHash && isConnected && (
          <Text py={4} fontSize="14px" color="#45a2f8">
            <LinkComponent href={txLink ? txLink : ''}>{txHash}</LinkComponent>
          </Text>
        )}{' '}
        <Box mt={8} p={4} borderWidth={1} borderRadius="lg">
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(require('../utils/deamon-bridge.json').tokensList, null, 2)}
          </pre>
        </Box>
      </main>
    </>
  )
}
