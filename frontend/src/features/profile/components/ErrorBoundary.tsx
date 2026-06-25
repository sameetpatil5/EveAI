import React from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('ProfilePage Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="text-[#991b1b] font-semibold">Something went wrong</div>
          <div className="text-sm text-[#475569] mt-2">{this.state.error?.message}</div>
        </div>
      )
    }

    return this.props.children
  }
}
