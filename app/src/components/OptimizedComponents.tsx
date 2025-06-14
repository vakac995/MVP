import React, { Suspense } from 'react';
import { Loader } from 'lucide-react';

// Create a registry of lazy-loaded components to avoid loading unused heavy dependencies

// Only load charts when specifically needed
export const LazyBarChart = React.lazy(() => 
  import('recharts').then(module => ({ 
    default: ({ data, width = 400, height = 300 }) => {
      const { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } = module;
      return (
        <ResponsiveContainer width={width} height={height}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  }))
);

// Only load 3D when specifically needed
export const LazyCanvas = React.lazy(() => 
  import('@react-three/fiber').then(module => ({ default: module.Canvas }))
);

// Shared loading component
const ComponentLoader = ({ message = "Loading component..." }) => (
  <div className="flex items-center justify-center h-32 w-full">
    <div className="flex items-center space-x-2">
      <Loader className="h-4 w-4 animate-spin" />
      <span className="text-xs text-muted-foreground">{message}</span>
    </div>
  </div>
);

// Wrapper components with suspense
export function ChartWrapper({ children, ...props }) {
  return (
    <Suspense fallback={<ComponentLoader message="Loading chart..." />}>
      <LazyBarChart {...props}>
        {children}
      </LazyBarChart>
    </Suspense>
  );
}

export function ThreeWrapper({ children, ...props }) {
  return (
    <Suspense fallback={<ComponentLoader message="Loading 3D scene..." />}>
      <LazyCanvas {...props}>
        {children}
      </LazyCanvas>
    </Suspense>
  );
}

// Lightweight alternatives that load immediately
export function SimpleChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-sm w-20">{item.name}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-sm w-12 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default {
  LazyBarChart,
  LazyCanvas,
  ChartWrapper,
  ThreeWrapper,
  SimpleChart
};