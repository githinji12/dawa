import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Search, Barcode, ShoppingCart, Trash2, Plus, Minus, Zap, Tag, Keyboard } from "lucide-react";
import { CartItem } from "@/lib/types";
import PaymentConfirmation from "@/components/pos/payment-confirmation";
import ReceiptGenerator from "@/components/pos/receipt-generator";
import BarcodeScanner from "@/components/pos/barcode-scanner";
import QuickActions from "@/components/pos/quick-actions";
import DiscountModal from "@/components/pos/discount-modal";
import KeyboardShortcuts from "@/components/pos/keyboard-shortcuts";

export default function Sales() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [saleChange, setSaleChange] = useState<number>(0);
  const [discount, setDiscount] = useState({ type: 'percentage' as const, value: 0, reason: '' });
  const { toast } = useToast();

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/drugs/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

  const { data: drugBatches } = useQuery({
    queryKey: ['/api/drug-batches'],
  });

  const { data: drugs } = useQuery({
    queryKey: ['/api/drugs'],
  });

  const addToCart = (drug: any) => {
    // Find available batch for this drug
    const availableBatch = drugBatches?.find((batch: any) => 
      batch.drugId === drug.id && batch.quantity > 0
    );

    if (!availableBatch) {
      toast({
        title: "Out of stock",
        description: `${drug.name} is not available`,
        variant: "destructive",
      });
      return;
    }

    // Check if item already in cart
    const existingItem = cart.find(item => item.drugBatchId === availableBatch.id);
    
    if (existingItem) {
      if (existingItem.quantity >= availableBatch.quantity) {
        toast({
          title: "Insufficient stock",
          description: `Only ${availableBatch.quantity} units available`,
          variant: "destructive",
        });
        return;
      }
      
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: Date.now(),
        drugId: drug.id,
        drugBatchId: availableBatch.id,
        name: drug.name,
        dosage: drug.dosage || '',
        batchNumber: availableBatch.batchNumber,
        quantity: 1,
        unitPrice: parseFloat(availableBatch.sellingPrice),
        totalPrice: parseFloat(availableBatch.sellingPrice),
        stock: availableBatch.quantity
      };
      
      setCart([...cart, newItem]);
    }
    
    setSearchQuery("");
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item => {
      if (item.id === itemId) {
        if (newQuantity > item.stock) {
          toast({
            title: "Insufficient stock",
            description: `Only ${item.stock} units available`,
            variant: "destructive",
          });
          return item;
        }
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleBarcodeScanned = (barcode: string) => {
    // Find drug by barcode
    const drug = drugs?.find(d => d.barcode === barcode);
    if (drug) {
      addToCart(drug);
      toast({
        title: "Item Added",
        description: `${drug.name} added to cart`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const processPayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Add items to cart before processing payment",
        variant: "destructive",
      });
      return;
    }
    
    setShowPaymentConfirmation(true);
  };

  const handlePaymentSuccess = (saleData: any) => {
    setLastSale(saleData);
    setSaleChange(saleData.change || 0);
    setShowReceipt(true);
    setCart([]);
    
    toast({
      title: "Payment Confirmed",
      description: "Sale completed successfully",
    });
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Point of Sale</h2>
        <Button variant="outline" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Search</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <Button 
                    variant="outline"
                    onClick={() => setShowBarcodeScanner(true)}
                  >
                    <Barcode className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </div>
              </div>

              {searchQuery.length > 2 && (
                <div className="space-y-2 mb-4">
                  {searchLoading ? (
                    <div className="p-4 text-center">Searching...</div>
                  ) : searchResults && searchResults.length > 0 ? (
                    searchResults.map((drug: any) => (
                      <div
                        key={drug.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => addToCart(drug)}
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
                                ? `KSh ${drugBatches.find((b: any) => b.drugId === drug.id).sellingPrice}`
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
                        addToCart(drug);
                      }}
                    >
                      {batch.drug?.name || 'Unknown'} - KSh {batch.sellingPrice}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart
              </CardTitle>
              <Badge variant="secondary">{cart.length} items</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-4">🛒</div>
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.dosage} • Batch: {item.batchNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              KSh {item.unitPrice.toFixed(2)} each
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-8 text-center">{item.quantity}</span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="font-medium ml-4">
                            KSh {item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>KSh {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>KSh {taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>KSh {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={processPayment}
                      className="w-full"
                      size="lg"
                    >
                      Process Payment
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div>
          <QuickActions 
            onAddToCart={addToCart}
            drugBatches={drugBatches || []}
          />
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmation
        isOpen={showPaymentConfirmation}
        onClose={() => setShowPaymentConfirmation(false)}
        cartItems={cart}
        subtotal={subtotal}
        taxAmount={taxAmount}
        totalAmount={total}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Receipt Generator Modal */}
      {lastSale && (
        <ReceiptGenerator
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          saleData={lastSale}
          change={saleChange}
        />
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  );
}