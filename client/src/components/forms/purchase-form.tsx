import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2 } from "lucide-react";

interface PurchaseItem {
  drugId: number;
  quantity: number;
  unitCost: number;
  totalCost: number;
  batchNumber: string;
  expiryDate: string;
}

interface PurchaseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PurchaseForm({ onSuccess, onCancel }: PurchaseFormProps) {
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      drugId: 0,
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      batchNumber: "",
      expiryDate: ""
    }
  ]);

  const { toast } = useToast();

  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const { data: drugs } = useQuery({
    queryKey: ['/api/drugs'],
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/purchases', data);
    },
    onSuccess: () => {
      toast({
        title: "Purchase order created",
        description: "Purchase order has been created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierId) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    const validItems = items.filter(item => 
      item.drugId > 0 && item.quantity > 0 && item.unitCost > 0 && item.batchNumber && item.expiryDate
    );

    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one valid item",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = validItems.reduce((sum, item) => sum + item.totalCost, 0);

    const payload = {
      purchase: {
        supplierId: parseInt(supplierId),
        totalAmount: totalAmount.toFixed(2),
        status: "pending"
      },
      items: validItems
    };

    mutation.mutate(payload);
  };

  const addItem = () => {
    setItems([...items, {
      drugId: 0,
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      batchNumber: "",
      expiryDate: ""
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total cost
    if (field === 'quantity' || field === 'unitCost') {
      updatedItems[index].totalCost = updatedItems[index].quantity * updatedItems[index].unitCost;
    }
    
    setItems(updatedItems);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalCost, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="supplier">Supplier *</Label>
        <Select value={supplierId} onValueChange={setSupplierId}>
          <SelectTrigger id="supplier">
            <SelectValue placeholder="Select supplier" />
          </SelectTrigger>
          <SelectContent>
            {suppliers?.filter((supplier: any) => supplier.isActive).map((supplier: any) => (
              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Purchase Items</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
              <div className="col-span-3">
                <Label>Drug</Label>
                <Select 
                  value={item.drugId.toString()} 
                  onValueChange={(value) => updateItem(index, 'drugId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select drug" />
                  </SelectTrigger>
                  <SelectContent>
                    {drugs?.map((drug: any) => (
                      <SelectItem key={drug.id} value={drug.id.toString()}>
                        {drug.name} {drug.dosage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              
              <div className="col-span-2">
                <Label>Unit Cost</Label>
                <Input
                  type="number"
                  value={item.unitCost}
                  onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="col-span-2">
                <Label>Batch Number</Label>
                <Input
                  value={item.batchNumber}
                  onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                  placeholder="Batch #"
                />
              </div>
              
              <div className="col-span-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={item.expiryDate}
                  onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                />
              </div>
              
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="col-span-12 text-right">
                <span className="text-sm text-muted-foreground">
                  Total: ${item.totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          
          <div className="text-right">
            <div className="text-lg font-semibold">
              Total Amount: ${getTotalAmount().toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
}
