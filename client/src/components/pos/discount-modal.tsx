import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, DollarSign, Tag } from "lucide-react";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (discountType: 'percentage' | 'fixed', discountValue: number, reason: string) => void;
  currentTotal: number;
}

export default function DiscountModal({ isOpen, onClose, onApplyDiscount, currentTotal }: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [reason, setReason] = useState('');

  const presetDiscounts = [
    { label: 'Senior Citizen', type: 'percentage' as const, value: 10, reason: 'Senior citizen discount' },
    { label: 'Student', type: 'percentage' as const, value: 5, reason: 'Student discount' },
    { label: 'Staff', type: 'percentage' as const, value: 15, reason: 'Staff discount' },
    { label: 'Bulk Purchase', type: 'fixed' as const, value: 50, reason: 'Bulk purchase discount' },
  ];

  const calculateDiscountAmount = () => {
    const value = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      return (currentTotal * value) / 100;
    }
    return value;
  };

  const finalTotal = currentTotal - calculateDiscountAmount();

  const handleApply = () => {
    const value = parseFloat(discountValue) || 0;
    if (value > 0) {
      onApplyDiscount(discountType, value, reason);
      onClose();
      resetForm();
    }
  };

  const handlePresetClick = (preset: typeof presetDiscounts[0]) => {
    setDiscountType(preset.type);
    setDiscountValue(preset.value.toString());
    setReason(preset.reason);
  };

  const resetForm = () => {
    setDiscountValue('');
    setReason('');
    setDiscountType('percentage');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Apply Discount
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Total */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Total:</span>
                <span className="font-bold text-lg">KSh {currentTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Preset Discounts */}
          <div>
            <Label className="text-sm font-medium">Quick Discounts</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {presetDiscounts.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="justify-start"
                >
                  <Badge variant="secondary" className="mr-2">
                    {preset.type === 'percentage' ? `${preset.value}%` : `KSh ${preset.value}`}
                  </Badge>
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Discount */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Custom Discount</Label>
            
            <div className="flex gap-2">
              <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Percentage
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fixed Amount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="flex-1"
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                placeholder="Discount reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          {/* Preview */}
          {discountValue && parseFloat(discountValue) > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Discount Amount:</span>
                    <span className="font-medium text-green-600">
                      -KSh {calculateDiscountAmount().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>New Total:</span>
                    <span className="text-green-600">KSh {finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleApply}
              disabled={!discountValue || parseFloat(discountValue) <= 0}
              className="flex-1"
            >
              Apply Discount
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}