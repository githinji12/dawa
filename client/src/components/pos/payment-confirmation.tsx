import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CartItem } from "@/lib/types";

interface PaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  onPaymentSuccess: (saleData: any) => void;
}

export default function PaymentConfirmation({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  taxAmount,
  totalAmount,
  onPaymentSuccess,
}: PaymentConfirmationProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [step, setStep] = useState<"payment" | "processing" | "success">("payment");
  const [processingMessage, setProcessingMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const change = parseFloat(amountReceived) - totalAmount;

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      setStep("processing");
      setProcessingMessage("Processing payment...");
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await apiRequest('POST', '/api/sales', paymentData);
      return response;
    },
    onSuccess: (saleData) => {
      setStep("success");
      setProcessingMessage("Payment confirmed successfully!");
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/drug-batches'] });
      
      // Show success toast
      toast({
        title: "Payment Confirmed",
        description: `Sale completed successfully. Receipt #${saleData.receiptNumber}`,
      });
      
      // Pass sale data to parent for receipt generation
      setTimeout(() => {
        onPaymentSuccess(saleData);
        handleClose();
      }, 1500);
    },
    onError: (error) => {
      setStep("payment");
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "cash" && (!amountReceived || parseFloat(amountReceived) < totalAmount)) {
      toast({
        title: "Insufficient Amount",
        description: "Amount received must be at least the total amount",
        variant: "destructive",
      });
      return;
    }

    const paymentData = {
      items: cartItems.map(item => ({
        drugBatchId: item.drugBatchId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal,
      taxAmount,
      totalAmount,
      paymentMethod,
      amountReceived: paymentMethod === "cash" ? parseFloat(amountReceived) : totalAmount,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
    };

    paymentMutation.mutate(paymentData);
  };

  const handleClose = () => {
    setStep("payment");
    setPaymentMethod("");
    setAmountReceived("");
    setCustomerName("");
    setCustomerPhone("");
    setProcessingMessage("");
    onClose();
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <DollarSign className="h-5 w-5" />;
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === "payment" && "Confirm Payment"}
            {step === "processing" && "Processing Payment"}
            {step === "success" && "Payment Confirmed"}
          </DialogTitle>
        </DialogHeader>

        {step === "payment" && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.dosage} • Batch: {item.batchNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">KSh {item.totalPrice.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × KSh {item.unitPrice.toFixed(2)}
                        </div>
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
                    <span>Tax:</span>
                    <span>KSh {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>KSh {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cash")}
                    className="h-20 flex-col"
                  >
                    <DollarSign className="h-6 w-6 mb-2" />
                    Cash
                  </Button>
                  <Button
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("card")}
                    className="h-20 flex-col"
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    Card
                  </Button>
                  <Button
                    variant={paymentMethod === "mobile" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("mobile")}
                    className="h-20 flex-col"
                  >
                    <Smartphone className="h-6 w-6 mb-2" />
                    Mobile Pay
                  </Button>
                </div>

                {paymentMethod === "cash" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amountReceived">Amount Received</Label>
                      <Input
                        id="amountReceived"
                        type="number"
                        step="0.01"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        placeholder="Enter amount received"
                      />
                    </div>
                    
                    {amountReceived && parseFloat(amountReceived) >= totalAmount && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Change to give:</span>
                          <span className="text-2xl font-bold text-green-600">
                            KSh {change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod && paymentMethod !== "cash" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(paymentMethod)}
                      <span className="font-medium">
                        {paymentMethod === "card" ? "Card Payment" : "Mobile Payment"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Amount: ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!paymentMethod || paymentMutation.isPending}
                className="flex-1"
              >
                {paymentMutation.isPending ? "Processing..." : "Confirm Payment"}
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600">{processingMessage}</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Confirmed!</h3>
            <p className="text-gray-600">{processingMessage}</p>
            <Badge variant="default" className="mt-4">
              Receipt will be generated
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}