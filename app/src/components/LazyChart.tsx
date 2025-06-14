import React, { Suspense } from 'react';
import { Loader } from 'lucide-react';

// Lazy load recharts components only when needed
const RechartsBarChart = React.lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);
const RechartsResponsiveContainer = React.lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);
const RechartsXAxis = React.lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);
const RechartsYAxis = React.lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);
const RechartsBar = React.lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);

interface ChartData {
  name: string;
  value: number;
}

interface LazyChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
}

const ChartLoadingSpinner = () => (
  <div className="flex items-center justify-center h-64 w-full">
    <div className="flex items-center space-x-2">
      <Loader className="h-5 w-5 animate-spin" />
      <span className="text-sm text-muted-foreground">Loading chart...</span>
    </div>
  </div>
);

export function LazyChart({ data, width = 400, height = 300 }: LazyChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSpinner />}>
      <div style={{ width, height }}>
        <RechartsResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data}>
            <RechartsXAxis dataKey="name" />
            <RechartsYAxis />
            <RechartsBar dataKey="value" fill="#3b82f6" />
          </RechartsBarChart>
        </RechartsResponsiveContainer>
      </div>
    </Suspense>
  );
}

export default LazyChart;