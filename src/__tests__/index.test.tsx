import React from 'react'
import { render, screen } from '../utils/test-utils'
import '@testing-library/jest-dom'
import Home from '@/pages/index'

describe('Home page', () => {
  it('shows connect wallet message', () => {
    render(<Home />)
    expect(screen.getByText(/Please connect your wallet/i)).toBeInTheDocument()
  })
})
