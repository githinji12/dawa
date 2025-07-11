import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Drug } from "@shared/schema";

interface DrugFormProps {
  drug?: Drug;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DrugForm({ drug, onSuccess, onCancel }: DrugFormProps) {
  const [formData, setFormData] = useState({
    name: drug?.name || "",
    genericName: drug?.genericName || "",
    brand: drug?.brand || "",
    categoryId: drug?.categoryId?.toString() || "",
    dosage: drug?.dosage || "",
    form: drug?.form || "",
    description: drug?.description || "",
    barcode: drug?.barcode || "",
    requiresPrescription: drug?.requiresPrescription || false,
    isActive: drug?.isActive ?? true
  });

  const { toast } = useToast();

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = drug ? `/api/drugs/${drug.id}` : '/api/drugs';
      const method = drug ? 'PUT' : 'POST';
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: drug ? "Drug updated" : "Drug created",
        description: drug ? "Drug has been updated successfully" : "New drug has been added to inventory",
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
    
    const payload = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
    };

    mutation.mutate(payload);
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Drug Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Paracetamol"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="genericName">Generic Name</Label>
          <Input
            id="genericName"
            value={formData.genericName}
            onChange={(e) => handleInputChange('genericName', e.target.value)}
            placeholder="e.g., Acetaminophen"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            placeholder="e.g., Panadol"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            value={formData.dosage}
            onChange={(e) => handleInputChange('dosage', e.target.value)}
            placeholder="e.g., 500mg"
          />
        </div>
        
        <div>
          <Label htmlFor="form">Form</Label>
          <Select value={formData.form} onValueChange={(value) => handleInputChange('form', value)}>
            <SelectTrigger id="form">
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="capsule">Capsule</SelectItem>
              <SelectItem value="syrup">Syrup</SelectItem>
              <SelectItem value="injection">Injection</SelectItem>
              <SelectItem value="cream">Cream</SelectItem>
              <SelectItem value="ointment">Ointment</SelectItem>
              <SelectItem value="drops">Drops</SelectItem>
              <SelectItem value="inhaler">Inhaler</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="barcode">Barcode</Label>
        <Input
          id="barcode"
          value={formData.barcode}
          onChange={(e) => handleInputChange('barcode', e.target.value)}
          placeholder="Product barcode"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Drug description and usage instructions"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="requiresPrescription">Requires Prescription</Label>
            <p className="text-sm text-muted-foreground">
              Check if this drug requires a prescription
            </p>
          </div>
          <Switch
            id="requiresPrescription"
            checked={formData.requiresPrescription}
            onCheckedChange={(checked) => handleInputChange('requiresPrescription', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isActive">Active</Label>
            <p className="text-sm text-muted-foreground">
              Inactive drugs won't appear in sales
            </p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleInputChange('isActive', checked)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : drug ? "Update Drug" : "Add Drug"}
        </Button>
      </div>
    </form>
  );
}
