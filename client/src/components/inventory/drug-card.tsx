import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface DrugCardProps {
  drug: any;
  batches: any[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function DrugCard({ drug, batches, onEdit, onDelete }: DrugCardProps) {
  const totalStock = batches.reduce((sum, batch) => sum + batch.quantity, 0);
  const averagePrice = batches.length > 0 
    ? batches.reduce((sum, batch) => sum + parseFloat(batch.sellingPrice), 0) / batches.length
    : 0;
  
  const getStatusBadge = () => {
    if (totalStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (totalStock <= 10) {
      return <Badge className="bg-orange-500">Low Stock</Badge>;
    } else {
      // Check for expiring soon
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const hasExpiring = batches.some(batch => 
        new Date(batch.expiryDate) <= thirtyDaysFromNow
      );
      
      if (hasExpiring) {
        return <Badge variant="destructive">Expiring Soon</Badge>;
      }
      
      return <Badge className="bg-green-500">In Stock</Badge>;
    }
  };

  const getNextExpiryDate = () => {
    if (batches.length === 0) return null;
    
    const sortedBatches = [...batches].sort((a, b) => 
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
    
    return sortedBatches[0].expiryDate;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <Card className="drug-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h6 className="font-semibold text-lg">{drug.name}</h6>
            <p className="text-sm text-muted-foreground">
              {drug.dosage && `${drug.dosage} • `}
              {drug.brand && `${drug.brand} • `}
              {drug.form || 'Unknown form'}
            </p>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Stock</div>
            <div className="text-xl font-bold">{totalStock}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg Price</div>
            <div className="text-xl font-bold">${averagePrice.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">
            {batches.length > 0 ? (
              <>
                <div>Batches: {batches.length}</div>
                {getNextExpiryDate() && (
                  <div>Next expiry: {formatDate(getNextExpiryDate()!)}</div>
                )}
              </>
            ) : (
              <div>No batches available</div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
