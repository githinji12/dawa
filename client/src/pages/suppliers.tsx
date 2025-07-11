import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Search, Building2 } from "lucide-react";
import SupplierForm from "@/components/forms/supplier-form";
import { Supplier } from "@shared/schema";

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete supplier');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "Supplier deleted",
        description: "Supplier has been removed successfully",
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

  const handleDeleteSupplier = (id: number) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplierMutation.mutate(id);
    }
  };

  const filteredSuppliers = suppliers?.filter((supplier: Supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
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
          <h2 className="text-3xl font-bold">Suppliers</h2>
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
        <h2 className="text-3xl font-bold">Supplier Management</h2>
        <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm
              onSuccess={() => {
                setIsAddingSupplier(false);
                queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
              }}
              onCancel={() => setIsAddingSupplier(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers && filteredSuppliers.length > 0 ? (
          filteredSuppliers.map((supplier: Supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{supplier.name}</h3>
                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {supplier.contactPerson && (
                          <div>👤 {supplier.contactPerson}</div>
                        )}
                        {supplier.email && (
                          <div>📧 {supplier.email}</div>
                        )}
                        {supplier.phone && (
                          <div>📞 {supplier.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {supplier.address && (
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Address:</span>
                    </div>
                    <div className="text-sm">{supplier.address}</div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mb-4">
                  Added: {formatDate(supplier.createdAt!)}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedSupplier(supplier)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingSupplier(supplier)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    disabled={deleteSupplierMutation.isPending}
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
              {searchQuery ? 'No suppliers match your search' : 'No suppliers found'}
            </div>
            <Button 
              className="mt-4" 
              onClick={() => setIsAddingSupplier(true)}
            >
              Add your first supplier
            </Button>
          </div>
        )}
      </div>

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <Dialog open={true} onOpenChange={() => setEditingSupplier(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm
              supplier={editingSupplier}
              onSuccess={() => {
                setEditingSupplier(null);
                queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
              }}
              onCancel={() => setEditingSupplier(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <Dialog open={true} onOpenChange={() => setSelectedSupplier(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Supplier Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Company Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Company Name:</span> {selectedSupplier.name}</div>
                    <div><span className="font-medium">Contact Person:</span> {selectedSupplier.contactPerson || 'Not provided'}</div>
                    <div><span className="font-medium">Email:</span> {selectedSupplier.email || 'Not provided'}</div>
                    <div><span className="font-medium">Phone:</span> {selectedSupplier.phone || 'Not provided'}</div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge variant={selectedSupplier.isActive ? "default" : "secondary"} className="ml-2">
                        {selectedSupplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Address</h4>
                  <div className="text-sm">
                    {selectedSupplier.address || 'No address provided'}
                  </div>
                  
                  <h4 className="font-semibold mb-3 mt-6">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Supplier ID:</span> #{selectedSupplier.id}</div>
                    <div><span className="font-medium">Added:</span> {formatDate(selectedSupplier.createdAt!)}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Purchase History</h4>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                      Purchase history and supplied products would be displayed here
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
