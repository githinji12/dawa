import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Share2, CheckCircle } from "lucide-react";
import { SaleWithItems } from "@/lib/types";

interface ReceiptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: SaleWithItems;
  change?: number;
}

export default function ReceiptGenerator({
  isOpen,
  onClose,
  saleData,
  change = 0,
}: ReceiptGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt #${saleData.receiptNumber}</title>
              <style>
                body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: white; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                .company-info { font-size: 12px; margin-bottom: 2px; }
                .receipt-info { text-align: center; margin-bottom: 15px; }
                .items { margin-bottom: 15px; }
                .item { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 14px; }
                .item-name { max-width: 180px; }
                .item-price { min-width: 60px; text-align: right; }
                .totals { border-top: 1px solid #000; padding-top: 10px; }
                .total-line { display: flex; justify-content: space-between; margin-bottom: 3px; }
                .total-final { font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 5px; }
                .footer { text-align: center; margin-top: 15px; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
                .thank-you { font-weight: bold; margin-bottom: 5px; }
                @media print { body { margin: 0; padding: 10px; } }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <div class="company-name">PHARMACARE POS</div>
                  <div class="company-info">Pharmacy Management System</div>
                  <div class="company-info">Tel: (555) 123-4567</div>
                </div>
                
                <div class="receipt-info">
                  <div><strong>Receipt #: ${saleData.receiptNumber}</strong></div>
                  <div>Date: ${new Date(saleData.createdAt).toLocaleDateString()}</div>
                  <div>Time: ${new Date(saleData.createdAt).toLocaleTimeString()}</div>
                  <div>Cashier: Admin</div>
                </div>
                
                <div class="items">
                  ${saleData.items.map(item => `
                    <div class="item">
                      <div class="item-name">
                        ${item.drugBatch?.drug?.name || 'Unknown Drug'}<br>
                        <small>${item.quantity} x KSh ${item.unitPrice.toFixed(2)}</small>
                      </div>
                      <div class="item-price">KSh ${item.totalPrice.toFixed(2)}</div>
                    </div>
                  `).join('')}
                </div>
                
                <div class="totals">
                  <div class="total-line">
                    <span>Subtotal:</span>
                    <span>KSh ${saleData.subtotal.toFixed(2)}</span>
                  </div>
                  <div class="total-line">
                    <span>Tax:</span>
                    <span>KSh ${saleData.taxAmount.toFixed(2)}</span>
                  </div>
                  <div class="total-line">
                    <span>Discount:</span>
                    <span>-KSh ${saleData.discountAmount.toFixed(2)}</span>
                  </div>
                  <div class="total-line total-final">
                    <span>TOTAL:</span>
                    <span>KSh ${saleData.totalAmount.toFixed(2)}</span>
                  </div>
                  <div class="total-line">
                    <span>Payment (${saleData.paymentMethod.toUpperCase()}):</span>
                    <span>KSh ${saleData.totalAmount.toFixed(2)}</span>
                  </div>
                  ${change > 0 ? `
                    <div class="total-line">
                      <span>Change:</span>
                      <span>KSh ${change.toFixed(2)}</span>
                    </div>
                  ` : ''}
                </div>
                
                <div class="footer">
                  <div class="thank-you">THANK YOU FOR YOUR BUSINESS!</div>
                  <div>Have a great day!</div>
                  <div>---</div>
                  <div>Return Policy: 30 days with receipt</div>
                  <div>For support: support@pharmacare.com</div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = () => {
    const element = receiptRef.current;
    if (element) {
      const receiptContent = element.innerHTML;
      const blob = new Blob([`
        <html>
          <head>
            <title>Receipt #${saleData.receiptNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .receipt { max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .total { font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${receiptContent}
            </div>
          </body>
        </html>
      `], { type: 'text/html' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${saleData.receiptNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Receipt Generated
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Receipt Preview */}
          <Card>
            <CardContent className="p-0">
              <div ref={receiptRef} className="p-6 bg-white font-mono text-sm max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2">PHARMACARE POS</h1>
                  <p className="text-gray-600">Pharmacy Management System</p>
                  <p className="text-gray-600">Tel: (555) 123-4567</p>
                </div>

                {/* Receipt Info */}
                <div className="text-center mb-6 space-y-1">
                  <div className="font-bold">Receipt #: {saleData.receiptNumber}</div>
                  <div>Date: {new Date(saleData.createdAt).toLocaleDateString()}</div>
                  <div>Time: {new Date(saleData.createdAt).toLocaleTimeString()}</div>
                  <div>Cashier: Admin</div>
                  <div>
                    <Badge variant="outline">
                      {saleData.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {saleData.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.drugBatch?.drug?.name || 'Unknown Drug'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.quantity} × KSh {item.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        KSh {item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>KSh {saleData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>KSh {saleData.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-KSh {saleData.discountAmount.toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL:</span>
                    <span>KSh {saleData.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Payment ({saleData.paymentMethod.toUpperCase()}):</span>
                    <span>KSh {saleData.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  {change > 0 && (
                    <div className="flex justify-between font-medium text-green-600">
                      <span>Change:</span>
                      <span>KSh {change.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Footer */}
                <div className="text-center text-sm space-y-2">
                  <div className="font-bold">THANK YOU FOR YOUR BUSINESS!</div>
                  <div>Have a great day!</div>
                  <div className="text-xs text-gray-600">
                    Return Policy: 30 days with receipt
                  </div>
                  <div className="text-xs text-gray-600">
                    For support: support@pharmacare.com
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}