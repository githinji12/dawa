import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  Clock, 
  Receipt,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { DashboardStats, AlertData } from "@/lib/types";

export default function CashierDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<AlertData>({
    queryKey: ['/api/dashboard/alerts'],
  });

  const { data: recentSales, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/dashboard/recent-sales'],
  });

  if (statsLoading || alertsLoading || salesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Cashier Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
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
        <div>
          <h2 className="text-3xl font-bold">Cashier Dashboard</h2>
          <p className="text-muted-foreground">Point of Sale Operations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/sales">
            <Button size="lg" className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Start New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Today's Sales</p>
                <p className="text-2xl font-bold">KSh {stats?.todaysSales?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Available Items</p>
                <p className="text-2xl font-bold">{stats?.totalItems || 0}</p>
              </div>
              <Package className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Low Stock Items</p>
                <p className="text-2xl font-bold">{stats?.lowStockCount || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Expiring Soon</p>
                <p className="text-2xl font-bold">{stats?.expiringCount || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/sales">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Point of Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Process customer transactions, manage cart, and generate receipts
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/inventory">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Check Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View current stock levels and drug information
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/customers">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage customer information and purchase history
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Alerts Section */}
      {(alerts?.lowStock?.length > 0 || alerts?.expiring?.length > 0) && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts?.lowStock?.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Low Stock Items</h4>
                  <div className="space-y-1">
                    {alerts.lowStock.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.drug?.name} ({item.drug?.dosage})</span>
                        <Badge variant="destructive">Only {item.quantity} left</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alerts?.expiring?.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Expiring Soon</h4>
                  <div className="space-y-1">
                    {alerts.expiring.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.drug?.name} ({item.drug?.dosage})</span>
                        <Badge variant="outline">
                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSales && recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.slice(0, 5).map((sale: any) => (
                <div key={sale.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">Receipt #{sale.receiptNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">KSh {sale.totalAmount}</div>
                    <Badge variant="outline">{sale.paymentMethod}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No recent sales found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}