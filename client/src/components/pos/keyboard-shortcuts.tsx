import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Keyboard, Search, ShoppingCart, CreditCard, Barcode, Percent, Trash2 } from "lucide-react";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    {
      category: "Search & Navigation",
      icon: Search,
      items: [
        { key: "Ctrl + F", description: "Focus search bar" },
        { key: "Ctrl + K", description: "Quick search" },
        { key: "Esc", description: "Clear search/Close modals" },
      ]
    },
    {
      category: "Cart Management",
      icon: ShoppingCart,
      items: [
        { key: "Ctrl + A", description: "Add item to cart" },
        { key: "Ctrl + D", description: "Remove item from cart" },
        { key: "Ctrl + E", description: "Clear entire cart" },
        { key: "+", description: "Increase quantity" },
        { key: "-", description: "Decrease quantity" },
      ]
    },
    {
      category: "Payment & Checkout",
      icon: CreditCard,
      items: [
        { key: "Ctrl + Enter", description: "Process payment" },
        { key: "Ctrl + P", description: "Print receipt" },
        { key: "Ctrl + R", description: "Reprint last receipt" },
        { key: "F9", description: "Cash payment" },
        { key: "F10", description: "Card payment" },
      ]
    },
    {
      category: "Quick Actions",
      icon: Barcode,
      items: [
        { key: "Ctrl + B", description: "Open barcode scanner" },
        { key: "Ctrl + U", description: "Customer lookup" },
        { key: "Ctrl + H", description: "Transaction history" },
        { key: "Ctrl + %", description: "Apply discount" },
      ]
    },
    {
      category: "System",
      icon: Keyboard,
      items: [
        { key: "Ctrl + /", description: "Show keyboard shortcuts" },
        { key: "Ctrl + L", description: "Lock/Logout" },
        { key: "F1", description: "Help" },
        { key: "F5", description: "Refresh" },
      ]
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle global shortcuts when modal is not open
      if (!isOpen && e.ctrlKey && e.key === '/') {
        e.preventDefault();
        // This would open the shortcuts modal
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-2 mb-3">
                <section.icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">{section.category}</h3>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {section.items.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.description}</span>
                          <Badge variant="outline" className="font-mono">
                            {item.key}
                          </Badge>
                        </div>
                        {index < section.items.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Keyboard className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Pro Tips</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use Tab to navigate between form fields</li>
              <li>• Press Enter to confirm actions in modals</li>
              <li>• Use number keys 1-9 for quick quantity entry</li>
              <li>• Hold Shift while using +/- to change by 10</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}