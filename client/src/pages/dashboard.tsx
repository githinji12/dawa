import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StatCard from "@/components/dashboard/stat-card";
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  CalendarX, 
  RefreshCw,
  TriangleAlert,
  Info
} from "lucide-react";
import { DashboardStats, AlertData } from "@/lib/types";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentSales, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/dashboard/recent-sales'],
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<AlertData>({
    queryKey: ['/api/dashboard/alerts'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (statsLoading || salesLoading || alertsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex items-center space-x-3">
            <span className="text-muted-foreground">Loading...</span>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="stat-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="flex items-center space-x-3">
          <span className="text-muted-foreground">
            Today: <strong>{formatDate(new Date().toISOString())}</strong>
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchStats()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats?.todaysSales || 0)}
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Total Items"
          value={stats?.totalItems || 0}
          icon={Package}
          color="success"
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Expiring Soon"
          value={stats?.expiringCount || 0}
          icon={CalendarX}
          color="danger"
        />
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales && recentSales.length > 0 ? (
                  recentSales.map((sale: any) => (
                    <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{sale.receiptNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(sale.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(sale.totalAmount)}</div>
                        <Badge variant="outline" className="success-green">
                          {sale.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent sales found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts?.lowStock && alerts.lowStock.length > 0 && (
                  alerts.lowStock.map((item: any) => (
                    <Alert key={`low-${item.id}`} className="border-orange-200">
                      <TriangleAlert className="h-4 w-4 text-orange-500" />
                      <AlertDescription>
                        <strong>{item.drug?.name || 'Unknown Drug'}</strong>
                        <br />
                        <span className="text-sm">Only {item.quantity} units remaining</span>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
                
                {alerts?.expiring && alerts.expiring.length > 0 && (
                  alerts.expiring.map((item: any) => (
                    <Alert key={`exp-${item.id}`} variant="destructive">
                      <CalendarX className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{item.drug?.name || 'Unknown Drug'}</strong>
                        <br />
                        <span className="text-sm">Expires {formatDate(item.expiryDate)}</span>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
                
                {(!alerts?.lowStock || alerts.lowStock.length === 0) && 
                 (!alerts?.expiring || alerts.expiring.length === 0) && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>All systems normal</strong>
                      <br />
                      <span className="text-sm">No alerts at this time</span>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
