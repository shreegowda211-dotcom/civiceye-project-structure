import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
          <div className="max-w-md rounded-lg bg-white p-8 shadow-lg ring-1 ring-red-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2M4.22 4.22a9 9 0 0 1 12.73 0M4.22 4.22L1 1m17.46 17.46L23 23m-10.73-10.73a4 4 0 0 1-5.66 0m11.32 0a9 9 0 0 0-12.73 0"
                />
              </svg>
            </div>

            <h1 className="text-center text-2xl font-bold text-red-800 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-center text-sm text-slate-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="mb-2 text-xs font-semibold text-red-800">Error Details (Development Only):</p>
                <details className="text-xs text-red-700">
                  <summary className="cursor-pointer font-semibold mb-2">
                    Click to expand error details
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[10px] bg-white p-2 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo && '\n\nComponent Stack:'}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
