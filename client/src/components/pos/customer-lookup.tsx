import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Phone, Mail, MapPin, Plus } from "lucide-react";

interface CustomerLookupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: any) => void;
}

export default function CustomerLookup({ isOpen, onClose, onSelectCustomer }: CustomerLookupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/customers'],
    enabled: isOpen,
  });

  const filteredCustomers = customers?.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    onSelectCustomer(customer);
    onClose();
  };

  const handleCreateNew = () => {
    // This would open a new customer form
    console.log("Create new customer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Lookup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={handleCreateNew} variant="outline" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>

          {/* Customer List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">Loading customers...</div>
            ) : filteredCustomers && filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer: any) => (
                <Card
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{customer.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                          {customer.address && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3" />
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          Customer #{customer.id}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No customers found matching your search" : "No customers found"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}