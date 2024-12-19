import React, { ErrorInfo, ReactNode } from 'react'
import { mobileModel, mobileVendor } from 'react-device-detect'
import { Box, Heading, Text, Link, Button, VStack, HStack, Divider } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  deviceInfo: string
  errorType: 'network' | 'device' | 'unknown'
  errorMessage: string
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      deviceInfo: '',
      errorType: 'unknown',
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Identify error type from error message
    let errorType: 'network' | 'device' | 'unknown' = 'unknown'

    if (error.message.includes('network') || error.message.includes('chain') || error.message.includes('connection')) {
      errorType = 'network'
    } else if (
      error.message.includes('device') ||
      error.message.includes('mobile') ||
      error.message.includes('browser')
    ) {
      errorType = 'device'
    }

    return {
      hasError: true,
      errorType,
      errorMessage: error.message,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  componentDidMount() {
    const deviceInfo = `${mobileVendor} ${mobileModel}`
    this.setState({ deviceInfo })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      errorType: 'unknown',
      errorMessage: '',
    })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.state.errorType === 'network') {
      return (
        <Box p={6} maxW="600px" mx="auto" mt={8}>
          <VStack spacing={4} align="stretch">
            <Heading size="lg" color="red.500">
              Network Error
            </Heading>
            <Text>
              Please check your network connection and make sure you&apos;re connected to the Sepolia network.
            </Text>
            <Text color="gray.500">Error details: {this.state.errorMessage}</Text>
            <Button colorScheme="blue" onClick={this.handleRetry}>
              Retry Connection
            </Button>
          </VStack>
        </Box>
      )
    }

    // Device or unknown error
    return (
      <Box p={6} maxW="600px" mx="auto" mt={8}>
        <VStack spacing={4} align="stretch">
          <Heading size="lg" color="red.500">
            Device Compatibility Issue
          </Heading>

          <Text>We apologize, but the app is not yet available on this type of device.</Text>

          <Text color="gray.500">Device info: {this.state.deviceInfo}</Text>

          <Divider />

          <Text>Please try accessing the application from a different device.</Text>

          <Box>
            <Text mb={2}>Need help? Contact Julien via:</Text>
            <HStack spacing={3} flexWrap="wrap">
              <Link href="https://matrix.to/#/@julienbrg:matrix.org" color="blue.500">
                Element
              </Link>
              <Link href="https://warpcast.com/julien-" color="blue.500">
                Farcaster
              </Link>
              <Link href="https://t.me/julienbrg" color="blue.500">
                Telegram
              </Link>
              <Link href="https://twitter.com/julienbrg" color="blue.500">
                Twitter
              </Link>
              <Link href="https://discordapp.com/users/julienbrg" color="blue.500">
                Discord
              </Link>
              <Link href="https://www.linkedin.com/in/julienberanger/" color="blue.500">
                LinkedIn
              </Link>
            </HStack>
          </Box>

          {this.state.errorType === 'unknown' && (
            <Button colorScheme="blue" onClick={this.handleRetry} mt={4}>
              Retry
            </Button>
          )}
        </VStack>
      </Box>
    )
  }
}

export default ErrorBoundary
