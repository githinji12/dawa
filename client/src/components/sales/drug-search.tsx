import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Barcode } from "lucide-react";

interface DrugSearchProps {
  onAddToCart: (drug: any) => void;
  drugBatches?: any[];
}

export default function DrugSearch({ onAddToCart, drugBatches }: DrugSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/drugs/search', searchQuery],
    enabled: searchQuery.length > 2,
    queryFn: async () => {
      const response = await fetch(`/api/drugs/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    }
  });

  const handleAddToCart = (drug: any) => {
    onAddToCart(drug);
    setSearchQuery("");
  };

  const handleScanBarcode = () => {
    // TODO: Implement barcode scanning functionality
    alert('Barcode scanning functionality would be implemented here');
  };

  return (
    <div className="pos-interface">
      <div className="mb-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drugs (name, barcode, batch)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={handleScanBarcode}>
            <Barcode className="h-4 w-4 mr-2" />
            Scan
          </Button>
        </div>
      </div>

      {searchQuery.length > 2 && (
        <div className="search-results mb-4">
          {searchLoading ? (
            <div className="p-4 text-center">Searching...</div>
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((drug: any) => (
              <div
                key={drug.id}
                className="search-result-item"
                onClick={() => handleAddToCart(drug)}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{drug.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {drug.dosage} | {drug.brand}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {drugBatches?.find((b: any) => b.drugId === drug.id)?.sellingPrice 
                        ? `$${drugBatches.find((b: any) => b.drugId === drug.id).sellingPrice}`
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No drugs found
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <h5 className="font-medium mb-3">Quick Access - Popular Items</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {drugBatches?.slice(0, 4).map((batch: any) => (
            <Button
              key={batch.id}
              variant="outline"
              className="justify-start"
              onClick={() => {
                const drug = { id: batch.drugId, name: batch.drug?.name || 'Unknown' };
                handleAddToCart(drug);
              }}
            >
              {batch.drug?.name || 'Unknown'} - ${batch.sellingPrice}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
