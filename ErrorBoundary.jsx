import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import mlCollector from './MLDataCollector';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
    
    this.setState(prev => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1
    }));

    // Record error for ML learning
    try {
      mlCollector.record('error', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        count: this.state.errorCount + 1
      });
    } catch (err) {
      console.error('Failed to record error:', err);
    }

    // Report to monitoring service (if available)
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Try to recover
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full bg-slate-950/98 border-red-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                Something Went Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-200 font-semibold mb-2">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                {this.props.showDetails && this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="text-sm text-red-300 cursor-pointer hover:text-red-200">
                      Technical Details
                    </summary>
                    <pre className="mt-2 text-xs text-red-300 overflow-auto p-3 bg-slate-900/50 rounded">
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={this.handleReset}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-purple-500/50 text-purple-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-slate-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <div className="text-center text-sm text-slate-400">
                <p>Error #{this.state.errorCount}</p>
                <p className="mt-1">
                  If this persists, please contact support or clear your cache
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;