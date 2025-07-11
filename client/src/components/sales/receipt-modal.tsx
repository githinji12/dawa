import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Mail } from "lucide-react";
import { CartItem } from "@/lib/types";

interface ReceiptModalProps {
  sale: any;
  items: CartItem[];
  onClose: () => void;
}

export default function ReceiptModal({ sale, items, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleEmailReceipt = () => {
    // TODO: Implement email receipt functionality
    alert('Email receipt functionality would be implemented here');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>
        
        <div className="receipt-preview">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold">PharmaCare Health Center</h4>
            <p className="text-sm">123 Medical Boulevard, Healthcare District</p>
            <p className="text-sm">Phone: +1 (555) 123-4567</p>
            <p className="text-sm">License: PHARM-2024-001</p>
          </div>
          
          <hr className="my-4" />
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <strong>Receipt #:</strong> {sale.receiptNumber}
            </div>
            <div className="text-right">
              <strong>Date:</strong> {formatDate(sale.createdAt || new Date().toISOString())}
            </div>
          </div>
          
          <div className="mb-4">
            <strong>Customer:</strong> Walk-in Customer<br />
            <strong>Payment Method:</strong> {sale.paymentMethod || 'Cash'}
          </div>
          
          <hr className="my-4" />
          
          <div className="mb-4">
            <div className="grid grid-cols-12 gap-2 font-bold mb-2">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            <hr className="mb-2" />
            
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 mb-1">
                <div className="col-span-5 text-sm">
                  {item.name} {item.dosage}
                </div>
                <div className="col-span-2 text-center text-sm">{item.quantity}</div>
                <div className="col-span-3 text-right text-sm">${item.unitPrice.toFixed(2)}</div>
                <div className="col-span-2 text-right text-sm">${item.totalPrice.toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <hr className="my-4" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div>Subtotal:</div>
              <div>Tax (8%):</div>
              <div>Discount:</div>
              <div className="font-bold">Total:</div>
            </div>
            <div className="text-right space-y-1">
              <div>${sale.subtotal}</div>
              <div>${sale.taxAmount}</div>
              <div>$0.00</div>
              <div className="font-bold">${sale.totalAmount}</div>
            </div>
          </div>
          
          <hr className="my-4" />
          
          <div className="text-center">
            <p className="text-sm">Thank you for your business!</p>
            <p className="text-xs text-muted-foreground mt-2">
              This is a computer-generated receipt
            </p>
          </div>
        </div>
        
        <DialogFooter className="no-print">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleEmailReceipt}>
            <Mail className="h-4 w-4 mr-2" />
            Email Receipt
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
