import React from 'react'
import {
  Flex,
  useColorModeValue,
  Spacer,
  Heading,
  Box,
  // Link,
  // Icon,
  // Menu,
  // MenuButton,
  // MenuList,
  // MenuItem,
  // IconButton,
} from '@chakra-ui/react'
import { LinkComponent } from './LinkComponent'
import { ThemeSwitcher } from './ThemeSwitcher'
// import { SITE_NAME } from '../utils/config'
// import { FaGithub } from 'react-icons/fa'
// import { Web3Modal } from '../context/web3modal'
// import { HamburgerIcon } from '@chakra-ui/icons'

interface Props {
  className?: string
}

export function Header(props: Props) {
  const className = props.className ?? ''

  return (
    <Flex
      as="header"
      className={className}
      bg={useColorModeValue('gray.100', 'gray.900')}
      px={4}
      py={5}
      mb={8}
      alignItems="center">
      <LinkComponent href="/" invisible>
        <Heading as="h1" size="md" mr={4}>
          Deamon Bridge
        </Heading>
      </LinkComponent>

      <Spacer />
      <Flex alignItems="center" gap={4}>
        <Box
          transform="scale(0.85)"
          sx={{
            'w3m-button': {
              transform: 'scale(0.85)',
              transformOrigin: 'right center',
            },
          }}>
          <w3m-button />
        </Box>
        <Flex alignItems="center">
          <ThemeSwitcher />
          {/* <Box mt={2} ml={6}>
            <Link href="https://github.com/w3hc/lambula" isExternal>
              <Icon as={FaGithub} boxSize={5} _hover={{ color: 'blue.500' }} />
            </Link>
          </Box> */}
        </Flex>
      </Flex>
    </Flex>
  )
}
