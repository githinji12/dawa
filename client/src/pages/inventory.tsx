import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Edit, Trash2, Filter } from "lucide-react";
import DrugForm from "@/components/forms/drug-form";
import DrugCard from "@/components/inventory/drug-card";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddingDrug, setIsAddingDrug] = useState(false);
  const [editingDrug, setEditingDrug] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drugs, isLoading } = useQuery({
    queryKey: ['/api/drugs'],
  });

  const { data: drugBatches } = useQuery({
    queryKey: ['/api/drug-batches'],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const deleteDrugMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/drugs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete drug');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drugs'] });
      toast({
        title: "Drug deleted",
        description: "Drug has been removed from inventory",
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

  const handleDeleteDrug = (id: number) => {
    if (confirm('Are you sure you want to delete this drug?')) {
      deleteDrugMutation.mutate(id);
    }
  };

  const exportInventory = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export started",
      description: "Inventory export functionality would be implemented here",
    });
  };

  const getDrugStatus = (drug: any) => {
    if (!drugBatches) return 'unknown';
    
    const drugBatchList = drugBatches.filter((batch: any) => batch.drugId === drug.id);
    const totalStock = drugBatchList.reduce((sum: number, batch: any) => sum + batch.quantity, 0);
    
    if (totalStock === 0) return 'out-of-stock';
    if (totalStock <= 10) return 'low-stock';
    
    // Check for expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const hasExpiring = drugBatchList.some((batch: any) => 
      new Date(batch.expiryDate) <= thirtyDaysFromNow
    );
    
    if (hasExpiring) return 'expiring';
    return 'in-stock';
  };

  const filteredDrugs = drugs?.filter((drug: any) => {
    const matchesSearch = drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drug.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drug.genericName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || drug.categoryId === parseInt(categoryFilter);
    
    const drugStatus = getDrugStatus(drug);
    const matchesStatus = statusFilter === 'all' || drugStatus === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Drug Inventory</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="drug-card">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
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
        <h2 className="text-3xl font-bold">Drug Inventory</h2>
        <div className="flex space-x-2">
          <Dialog open={isAddingDrug} onOpenChange={setIsAddingDrug}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Drug
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Drug</DialogTitle>
              </DialogHeader>
              <DrugForm
                onSuccess={() => {
                  setIsAddingDrug(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/drugs'] });
                }}
                onCancel={() => setIsAddingDrug(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={exportInventory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search drugs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category: any) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Drug Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrugs && filteredDrugs.length > 0 ? (
          filteredDrugs.map((drug: any) => (
            <DrugCard
              key={drug.id}
              drug={drug}
              batches={drugBatches?.filter((batch: any) => batch.drugId === drug.id) || []}
              onEdit={() => setEditingDrug(drug)}
              onDelete={() => handleDeleteDrug(drug.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? 'No drugs match your filters'
                : 'No drugs in inventory'
              }
            </div>
          </div>
        )}
      </div>

      {/* Edit Drug Modal */}
      {editingDrug && (
        <Dialog open={true} onOpenChange={() => setEditingDrug(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Drug</DialogTitle>
            </DialogHeader>
            <DrugForm
              drug={editingDrug}
              onSuccess={() => {
                setEditingDrug(null);
                queryClient.invalidateQueries({ queryKey: ['/api/drugs'] });
              }}
              onCancel={() => setEditingDrug(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
