'use client';

import { Component, ReactNode } from 'react';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard } from '@/components/ui/RetroCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <RetroCard className="p-8 max-w-md text-center" variant="danger">
            <div className="w-12 h-12 rounded-xl bg-retro-red/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-retro-red text-xl">!</span>
            </div>
            <div className="text-lg font-bold text-text-primary mb-2">
              Something went wrong
            </div>
            <p className="text-sm text-text-muted mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-3 justify-center">
              <RetroButton onClick={this.handleRetry}>
                Try Again
              </RetroButton>
              <RetroButton variant="ghost" onClick={this.handleReload}>
                Reload Page
              </RetroButton>
            </div>
          </RetroCard>
        </div>
      );
    }

    return this.props.children;
  }
}
