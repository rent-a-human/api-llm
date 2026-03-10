import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would typically send the error to a logging service
      // like Sentry, LogRocket, etc.
      console.error('Production error logging would go here');
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-2xl border border-red-700 p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-300 mb-6">
              The 3D Flight Tracker encountered an unexpected error. This might be due to:
            </p>

            {/* Common Issues */}
            <div className="text-left mb-8 space-y-2 text-sm text-gray-400">
              <div className="flex items-start space-x-2">
                <span className="text-red-400">•</span>
                <span>WebGL not supported or disabled in your browser</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-400">•</span>
                <span>Insufficient GPU memory or graphics driver issues</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-400">•</span>
                <span>Network connectivity issues with the flight data API</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-400">•</span>
                <span>Browser compatibility or JavaScript errors</span>
              </div>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-900 rounded-lg">
                <summary className="text-red-400 cursor-pointer mb-2">
                  Technical Details (Development)
                </summary>
                <pre className="text-xs text-red-300 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>

            {/* Help Information */}
            <div className="mt-8 pt-6 border-t border-gray-700 text-xs text-gray-500">
              <p className="mb-2">
                If this problem persists, try:
              </p>
              <div className="space-y-1 text-left">
                <p>• Refresh the page or clear your browser cache</p>
                <p>• Disable browser extensions that might interfere</p>
                <p>• Update your graphics drivers</p>
                <p>• Try using a different browser (Chrome, Firefox, Safari)</p>
                <p>• Enable hardware acceleration in browser settings</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;