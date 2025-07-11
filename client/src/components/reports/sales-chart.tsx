import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SalesChartProps {
  data: any[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Group sales by date
    const salesByDate: { [key: string]: number } = {};
    
    data.forEach((sale: any) => {
      const date = new Date(sale.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      salesByDate[date] = (salesByDate[date] || 0) + parseFloat(sale.totalAmount);
    });
    
    return Object.entries(salesByDate).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [data]);

  const maxAmount = Math.max(...chartData.map(d => d.amount), 0);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No sales data available for chart
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {chartData.slice(-7).map((item, index) => {
          const height = maxAmount > 0 ? (item.amount / maxAmount) * 200 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="text-xs text-muted-foreground">
                ${item.amount.toFixed(0)}
              </div>
              <div 
                className="w-8 bg-primary rounded-t-sm min-h-[20px] flex items-end"
                style={{ height: `${Math.max(height, 20)}px` }}
              ></div>
              <div className="text-xs font-medium">
                {item.date}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Daily sales for the last 7 days
      </div>
    </div>
  );
}
