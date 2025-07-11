import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CreditCard, Save } from "lucide-react";
import { CartItem } from "@/lib/types";

interface CartProps {
  items: CartItem[];
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onProcessPayment: () => void;
  onSaveQuote: () => void;
  isProcessing: boolean;
}

export default function Cart({
  items,
  paymentMethod,
  onPaymentMethodChange,
  onUpdateQuantity,
  onRemoveItem,
  onProcessPayment,
  onSaveQuote,
  isProcessing
}: CartProps) {
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Shopping Cart</CardTitle>
        <Badge variant="secondary">{items.length} items</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-4">🛒</div>
              <p>Cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.dosage} | Batch: {item.batchNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${item.unitPrice.toFixed(2)} each
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="font-medium">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (8%):</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-$0.00</span>
          </div>
          <hr />
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit Card</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={onProcessPayment}
              disabled={items.length === 0 || isProcessing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Process Payment"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onSaveQuote}
              disabled={items.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Quote
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
