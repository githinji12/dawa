import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import CustomerForm from "@/components/forms/customer-form";
import { Customer } from "@shared/schema";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/customers'],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete customer');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Customer deleted",
        description: "Customer has been removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const handleDeleteCustomer = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const filteredCustomers = customers?.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Customers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
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
        <h2 className="text-3xl font-bold">Customer Management</h2>
        <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              onSuccess={() => {
                setIsAddingCustomer(false);
                queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
              }}
              onCancel={() => setIsAddingCustomer(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers && filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer: Customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {customer.email && <div>📧 {customer.email}</div>}
                      {customer.phone && <div>📞 {customer.phone}</div>}
                      {customer.dateOfBirth && (
                        <div>🎂 Born: {formatDate(customer.dateOfBirth)}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {customer.address && (
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Address:</span>
                    </div>
                    <div className="text-sm">{customer.address}</div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mb-4">
                  Customer since: {formatDate(customer.createdAt!)}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingCustomer(customer)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    disabled={deleteCustomerMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              {searchQuery ? 'No customers match your search' : 'No customers found'}
            </div>
            <Button 
              className="mt-4" 
              onClick={() => setIsAddingCustomer(true)}
            >
              Add your first customer
            </Button>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <Dialog open={true} onOpenChange={() => setEditingCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer}
              onSuccess={() => {
                setEditingCustomer(null);
                queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
              }}
              onCancel={() => setEditingCustomer(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Dialog open={true} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedCustomer.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedCustomer.email || 'Not provided'}</div>
                    <div><span className="font-medium">Phone:</span> {selectedCustomer.phone || 'Not provided'}</div>
                    <div><span className="font-medium">Date of Birth:</span> {formatDate(selectedCustomer.dateOfBirth)}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Address</h4>
                  <div className="text-sm">
                    {selectedCustomer.address || 'No address provided'}
                  </div>
                  
                  <h4 className="font-semibold mb-3 mt-6">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Customer ID:</span> #{selectedCustomer.id}</div>
                    <div><span className="font-medium">Joined:</span> {formatDate(selectedCustomer.createdAt!)}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Purchase History</h4>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                      Purchase history would be displayed here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
