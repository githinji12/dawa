import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import SalesChart from "@/components/reports/sales-chart";

export default function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [period, setPeriod] = useState("this-month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales'],
    enabled: reportType === 'sales',
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/drug-batches'],
    enabled: reportType === 'inventory',
  });

  const generateReport = () => {
    // TODO: Implement PDF generation
    alert('PDF generation would be implemented here');
  };

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

  const getSalesStats = () => {
    if (!salesData) return { total: 0, count: 0, average: 0 };
    
    const total = salesData.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalAmount), 0);
    const count = salesData.length;
    const average = count > 0 ? total / count : 0;
    
    return { total, count, average };
  };

  const getTopSellingItems = () => {
    // Mock data for demonstration
    return [
      { name: "Paracetamol 500mg", quantity: 245, revenue: 1102.50 },
      { name: "Vitamin C 1000mg", quantity: 127, revenue: 1562.10 },
      { name: "Ibuprofen 200mg", quantity: 98, revenue: 661.50 },
      { name: "Amoxicillin 250mg", quantity: 76, revenue: 665.00 },
      { name: "Aspirin 100mg", quantity: 65, revenue: 211.25 }
    ];
  };

  const getExpiringItems = () => {
    if (!inventoryData) return [];
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return inventoryData.filter((batch: any) => 
      new Date(batch.expiryDate) <= thirtyDaysFromNow
    ).slice(0, 10);
  };

  const getLowStockItems = () => {
    if (!inventoryData) return [];
    
    return inventoryData.filter((batch: any) => batch.quantity <= 10).slice(0, 10);
  };

  const salesStats = getSalesStats();
  const topSellingItems = getTopSellingItems();
  const expiringItems = getExpiringItems();
  const lowStockItems = getLowStockItems();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Reports & Analytics</h2>
        <Button onClick={generateReport}>
          <Download className="h-4 w-4 mr-2" />
          Generate PDF
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="inventory">Inventory Report</SelectItem>
                <SelectItem value="expiry">Expiry Report</SelectItem>
                <SelectItem value="customer">Customer Report</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={period !== 'custom'}
            />
            
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={period !== 'custom'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          {/* Sales Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesStats.total)}</div>
                <p className="text-xs text-muted-foreground">
                  From {salesStats.count} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesStats.average)}</div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesStats.count}</div>
                <p className="text-xs text-muted-foreground">
                  Total completed sales
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={salesData} />
            </CardContent>
          </Card>

          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSellingItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.quantity} units sold</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Report */}
      {reportType === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low Stock Items */}
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((batch: any) => (
                      <div key={batch.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Batch: {batch.batchNumber}</div>
                          <div className="text-sm text-muted-foreground">Drug ID: {batch.drugId}</div>
                        </div>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">
                          {batch.quantity} left
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No low stock items
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expiring Items */}
            <Card>
              <CardHeader>
                <CardTitle>Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringItems.length > 0 ? (
                    expiringItems.map((batch: any) => (
                      <div key={batch.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Batch: {batch.batchNumber}</div>
                          <div className="text-sm text-muted-foreground">Drug ID: {batch.drugId}</div>
                        </div>
                        <Badge variant="destructive">
                          {formatDate(batch.expiryDate)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No items expiring soon
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Expiry Report */}
      {reportType === 'expiry' && (
        <Card>
          <CardHeader>
            <CardTitle>Expiry Tracking Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiringItems.length > 0 ? (
                expiringItems.map((batch: any) => (
                  <div key={batch.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Batch: {batch.batchNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        Drug ID: {batch.drugId} | Quantity: {batch.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">{formatDate(batch.expiryDate)}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No items expiring in the next 30 days
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Report */}
      {reportType === 'customer' && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Customer analytics and purchase patterns would be displayed here
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
