import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for now; could integrate Sentry/analytics here
    console.error('ErrorBoundary caught error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-xl w-full bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">An unexpected error occurred while rendering the application.</p>
            <details className="mb-4 text-xs text-gray-500 whitespace-pre-wrap">
              {String(this.state.error)}
            </details>
            <div className="flex gap-2">
              <button onClick={this.handleReload} className="px-4 py-2 bg-blue-600 text-black rounded">Reload</button>
              <button onClick={() => window.location.href = '/'} className="px-4 py-2 border rounded">Home</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
