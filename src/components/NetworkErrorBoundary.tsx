import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Text, Button, useToast } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class NetworkErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Network Error:', error)
    console.error('Error Info:', errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={4} borderWidth={1} borderRadius="lg" m={4}>
          <Text fontSize="lg" mb={4}>
            Network Connection Error
          </Text>
          <Text mb={4}>
            {this.state.error?.message || 'Please check if you are connected to the correct network (Sepolia).'}
          </Text>
          <Button colorScheme="blue" onClick={this.handleRetry}>
            Retry Connection
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

export default NetworkErrorBoundary
