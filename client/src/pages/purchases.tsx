import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Eye, CheckCircle, XCircle } from "lucide-react";
import PurchaseForm from "@/components/forms/purchase-form";
import { PurchaseWithItems } from "@/lib/types";

export default function Purchases() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithItems | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['/api/purchases'],
  });

  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const updatePurchaseMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, receivedDate: status === 'received' ? new Date() : null })
      });
      if (!response.ok) throw new Error('Failed to update purchase');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      toast({
        title: "Purchase updated",
        description: "Purchase status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (purchaseId: number, newStatus: string) => {
    updatePurchaseMutation.mutate({ id: purchaseId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'received':
        return <Badge className="bg-green-100 text-green-800">Received</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPurchases = purchases?.filter((purchase: any) => {
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    const matchesSearch = purchase.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         purchase.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Purchases</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <h2 className="text-3xl font-bold">Purchase Management</h2>
        <div className="flex space-x-2">
          <Dialog open={isAddingPurchase} onOpenChange={setIsAddingPurchase}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <PurchaseForm
                onSuccess={() => {
                  setIsAddingPurchase(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
                }}
                onCancel={() => setIsAddingPurchase(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Input
          placeholder="Search purchases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchase List */}
      <div className="space-y-4">
        {filteredPurchases && filteredPurchases.length > 0 ? (
          filteredPurchases.map((purchase: any) => (
            <Card key={purchase.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold">{purchase.purchaseNumber}</h3>
                      {getStatusBadge(purchase.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Supplier:</span>
                        <div>{suppliers?.find((s: any) => s.id === purchase.supplierId)?.name || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="font-medium">Order Date:</span>
                        <div>{formatDate(purchase.orderDate)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Total Amount:</span>
                        <div className="font-semibold text-foreground">{formatCurrency(purchase.totalAmount)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Received Date:</span>
                        <div>{purchase.receivedDate ? formatDate(purchase.receivedDate) : 'Not received'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPurchase(purchase)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {purchase.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(purchase.id, 'received')}
                        disabled={updatePurchaseMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Received
                      </Button>
                    )}
                    
                    {purchase.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(purchase.id, 'cancelled')}
                        disabled={updatePurchaseMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No purchases match your filters'
                  : 'No purchase orders found'
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <Dialog open={true} onOpenChange={() => setSelectedPurchase(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Purchase Order Details - {selectedPurchase.purchaseNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedPurchase.status)}</div>
                    <div><span className="font-medium">Order Date:</span> {formatDate(selectedPurchase.orderDate)}</div>
                    {selectedPurchase.receivedDate && (
                      <div><span className="font-medium">Received Date:</span> {formatDate(selectedPurchase.receivedDate)}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Supplier Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedPurchase.supplier?.name}</div>
                    <div><span className="font-medium">Contact:</span> {selectedPurchase.supplier?.contactPerson}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Drug</th>
                        <th className="text-center p-3">Quantity</th>
                        <th className="text-right p-3">Unit Cost</th>
                        <th className="text-right p-3">Total</th>
                        <th className="text-center p-3">Batch</th>
                        <th className="text-center p-3">Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPurchase.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.drug?.name || 'Unknown Drug'}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">{formatCurrency(item.unitCost)}</td>
                          <td className="p-3 text-right">{formatCurrency(item.totalCost)}</td>
                          <td className="p-3 text-center">{item.batchNumber}</td>
                          <td className="p-3 text-center">{formatDate(item.expiryDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-semibold">Total Amount:</td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(selectedPurchase.totalAmount)}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
