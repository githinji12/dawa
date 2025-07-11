import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Grid, List } from "lucide-react";
import CategoryForm from "@/components/forms/category-form";
import CategoryCard from "@/components/inventory/category-card";

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: drugs } = useQuery({
    queryKey: ['/api/drugs'],
  });

  // Count drugs per category
  const getCategoryDrugCount = (categoryId: number) => {
    if (!drugs) return 0;
    return drugs.filter((drug: any) => drug.categoryId === categoryId).length;
  };

  const filteredCategories = categories?.filter((category: any) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Drug Categories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Drug Categories</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage drug categories and classifications
          </p>
        </div>
        
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setIsAddingCategory(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {categories?.length || 0}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Total Categories
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {categories?.filter((cat: any) => getCategoryDrugCount(cat.id) > 0).length || 0}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Active Categories
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {categories?.filter((cat: any) => getCategoryDrugCount(cat.id) === 0).length || 0}
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400">
                Empty Categories
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {drugs?.length || 0}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Total Drugs
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "No categories found matching your search." : "No categories created yet."}
            </div>
            {!searchQuery && (
              <Button 
                className="mt-4"
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredCategories.map((category: any) => (
            <CategoryCard
              key={category.id}
              category={category}
              drugCount={getCategoryDrugCount(category.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}