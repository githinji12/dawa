import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import CategoryForm from "@/components/forms/category-form";

interface CategoryCardProps {
  category: any;
  drugCount?: number;
}

export default function CategoryCard({ category, drugCount = 0 }: CategoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/categories/${category.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Category deleted",
        description: `Category "${category.name}" has been removed`,
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Cannot delete category with existing drugs",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (drugCount > 0) {
      toast({
        title: "Cannot delete category",
        description: "This category contains drugs. Please move or delete the drugs first.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      deleteCategoryMutation.mutate();
    }
  };

  return (
    <>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {category.name}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteCategoryMutation.isPending}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {category.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {drugCount} {drugCount === 1 ? 'drug' : 'drugs'}
              </span>
            </div>
            
            <Badge variant={drugCount > 0 ? "default" : "secondary"}>
              {drugCount > 0 ? "Active" : "Empty"}
            </Badge>
          </div>
          
          {category.createdAt && (
            <p className="text-xs text-gray-500 mt-2">
              Created: {new Date(category.createdAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm 
            category={category} 
            onSuccess={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}