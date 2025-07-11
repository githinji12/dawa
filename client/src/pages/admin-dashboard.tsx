import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Settings,
  FileText,
  Truck
} from "lucide-react";
import { Link } from "wouter";
import { DashboardStats, AlertData } from "@/lib/types";

export default function AdminDashboard() {
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
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
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
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">Complete Pharmacy Management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/settings">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </Link>
          <Link href="/reports">
            <Button size="lg" className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Today's Sales</p>
                <p className="text-2xl font-bold">KSh {stats?.todaysSales?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Items</p>
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
                <p className="text-yellow-100">Low Stock</p>
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

      {/* Management Options */}
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
                Process transactions and manage sales
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/inventory">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage drugs, categories, and stock levels
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/purchases">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Purchase Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create purchase orders and manage suppliers
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/suppliers">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Supplier Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage supplier information and contacts
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/customers">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage customer database and history
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/reports">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate detailed reports and analytics
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* System Alerts */}
      {(alerts?.lowStock?.length > 0 || alerts?.expiring?.length > 0) && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts?.lowStock?.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Low Stock Items ({alerts.lowStock.length})</h4>
                  <div className="space-y-1">
                    {alerts.lowStock.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.drug?.name} ({item.drug?.dosage})</span>
                        <Badge variant="destructive">Only {item.quantity} left</Badge>
                      </div>
                    ))}
                    {alerts.lowStock.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        ...and {alerts.lowStock.length - 5} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {alerts?.expiring?.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Expiring Soon ({alerts.expiring.length})</h4>
                  <div className="space-y-1">
                    {alerts.expiring.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.drug?.name} ({item.drug?.dosage})</span>
                        <Badge variant="outline">
                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                    {alerts.expiring.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        ...and {alerts.expiring.length - 5} more items
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/categories">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}