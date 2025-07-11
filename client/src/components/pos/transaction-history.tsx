import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Clock, Receipt, Eye, Print } from "lucide-react";
import { format } from "date-fns";

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const { data: sales, isLoading } = useQuery({
    queryKey: ['/api/sales'],
    enabled: isOpen,
  });

  const filteredSales = sales?.filter((sale: any) =>
    sale.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customerPhone?.includes(searchQuery)
  );

  const handleViewDetails = (sale: any) => {
    setSelectedTransaction(sale);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaction History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by receipt number, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Transaction List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : filteredSales && filteredSales.length > 0 ? (
              filteredSales.map((sale: any) => (
                <Card key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Receipt className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">#{sale.receiptNumber}</h4>
                            <Badge className={getStatusColor(sale.status)}>
                              {sale.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                          </div>
                          {sale.customerName && (
                            <div className="text-sm text-gray-600">
                              Customer: {sale.customerName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          KSh {sale.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {sale.paymentMethod}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(sale)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Print className="h-3 w-3 mr-1" />
                            Print
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No transactions found matching your search" : "No transactions found"}
              </div>
            )}
          </div>

          {/* Transaction Details Modal */}
          {selectedTransaction && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Transaction Details</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTransaction(null)}
                  >
                    Close
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Receipt Number:</span>
                    <p>#{selectedTransaction.receiptNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p>{format(new Date(selectedTransaction.createdAt), 'PPP')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Payment Method:</span>
                    <p>{selectedTransaction.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span>
                    <p className="font-bold">KSh {selectedTransaction.totalAmount.toFixed(2)}</p>
                  </div>
                  {selectedTransaction.customerName && (
                    <>
                      <div>
                        <span className="font-medium">Customer:</span>
                        <p>{selectedTransaction.customerName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p>{selectedTransaction.customerPhone}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Today's Summary</h4>
                  <p className="text-sm text-gray-600">
                    {filteredSales?.filter((sale: any) => 
                      new Date(sale.createdAt).toDateString() === new Date().toDateString()
                    ).length || 0} transactions
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    KSh {filteredSales?.filter((sale: any) => 
                      new Date(sale.createdAt).toDateString() === new Date().toDateString()
                    ).reduce((sum: number, sale: any) => sum + sale.totalAmount, 0).toFixed(2) || '0.00'}
                  </div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}