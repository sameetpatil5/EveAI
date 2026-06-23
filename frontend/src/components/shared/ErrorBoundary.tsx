import * as React from 'react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc] px-4 py-10">
          <div className="max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-[#0f172a]">Something went wrong</h1>
            <p className="mt-3 text-sm text-[#475569]">Please refresh the page or try again later.</p>
            <div className="mt-6">
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
