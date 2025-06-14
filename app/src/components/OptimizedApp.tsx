import { Loader } from "lucide-react";
import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';


// Lazy load heavy components
const Router = React.lazy(() => import('./Router'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex items-center space-x-2">
      <Loader className="h-6 w-6 animate-spin" />
      <span>Loading application...</span>
    </div>
  </div>
);

// Error boundary for lazy loaded components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function OptimizedApp() {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Router />
      </Suspense>
    </LazyErrorBoundary>
  );
}