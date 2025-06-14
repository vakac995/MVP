import React, { Suspense } from 'react';
import { Loader } from 'lucide-react';

// Lazy load Three.js components only when needed
const Canvas = React.lazy(() => 
  import('@react-three/fiber').then(module => ({ default: module.Canvas }))
);

interface LazyThreeSceneProps {
  children: React.ReactNode;
  className?: string;
}

const ThreeLoadingSpinner = () => (
  <div className="flex items-center justify-center h-64 w-full bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-2">
      <Loader className="h-5 w-5 animate-spin" />
      <span className="text-sm text-muted-foreground">Loading 3D scene...</span>
    </div>
  </div>
);

export function LazyThreeScene({ children, className = "h-64 w-full" }: LazyThreeSceneProps) {
  return (
    <div className={className}>
      <Suspense fallback={<ThreeLoadingSpinner />}>
        <Canvas>
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}

export default LazyThreeScene;