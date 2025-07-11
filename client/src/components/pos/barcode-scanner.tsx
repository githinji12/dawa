import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scanner, X } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleManualEntry = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode("");
      onClose();
    }
  };

  const simulateBarcodeScan = () => {
    setIsScanning(true);
    // Simulate scanning one of the existing barcodes
    const sampleBarcodes = [
      '1234567890123',
      '1234567890124', 
      '1234567890125',
      '1234567890126',
      '1234567890127',
      '1234567890128'
    ];
    
    setTimeout(() => {
      const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
      onScan(randomBarcode);
      setIsScanning(false);
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (!isOpen) {
      setManualBarcode("");
      setIsScanning(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scanner className="h-5 w-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Simulated Camera View */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {isScanning ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <Scanner className="h-16 w-16 mx-auto text-blue-500" />
                </div>
                <p className="text-lg font-medium">Scanning...</p>
                <p className="text-sm text-gray-600">Point camera at barcode</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Scanner className="h-16 w-16 mx-auto text-gray-400" />
                <p className="text-lg font-medium">Ready to Scan</p>
                <p className="text-sm text-gray-600">Position barcode in view</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={simulateBarcodeScan}
              disabled={isScanning}
              className="flex-1"
            >
              {isScanning ? "Scanning..." : "Simulate Scan"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isScanning}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Manual Entry */}
          <div className="border-t pt-4">
            <Label htmlFor="manualBarcode">Manual Barcode Entry</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="manualBarcode"
                placeholder="Enter barcode manually"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
              />
              <Button onClick={handleManualEntry}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}