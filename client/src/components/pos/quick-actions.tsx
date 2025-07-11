import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Star, 
  TrendingUp, 
  Zap,
  Pill,
  Heart,
  Shield,
  Thermometer,
  User
} from "lucide-react";
import CustomerLookup from "./customer-lookup";
import TransactionHistory from "./transaction-history";

interface QuickActionsProps {
  onAddToCart: (drug: any) => void;
  drugBatches: any[];
}

export default function QuickActions({ onAddToCart, drugBatches }: QuickActionsProps) {
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  // Popular items based on category
  const popularItems = [
    { name: "Paracetamol", category: "Pain Relief", icon: Pill, color: "bg-blue-500" },
    { name: "Ibuprofen", category: "Pain Relief", icon: Heart, color: "bg-red-500" },
    { name: "Amoxicillin", category: "Antibiotics", icon: Shield, color: "bg-green-500" },
    { name: "Cetirizine", category: "Cold & Flu", icon: Thermometer, color: "bg-purple-500" },
  ];

  // Recent transactions (simulated)
  const recentItems = [
    "Vitamin C", "Omeprazole", "Paracetamol", "Cetirizine"
  ];

  const handleQuickAdd = (drugName: string) => {
    // Find the drug in drugBatches
    const batch = drugBatches?.find(batch => 
      batch.drug?.name?.toLowerCase() === drugName.toLowerCase()
    );
    
    if (batch) {
      const drug = {
        id: batch.drugId,
        name: batch.drug.name,
        dosage: batch.drug.dosage,
        brand: batch.drug.brand
      };
      onAddToCart(drug);
    }
  };

  return (
    <div className="space-y-4">
      {/* Popular Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-yellow-500" />
            Popular Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {popularItems.map((item) => (
              <Button
                key={item.name}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => handleQuickAdd(item.name)}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${item.color}`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.category}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            Recent Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentItems.map((item) => (
              <Button
                key={item}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleQuickAdd(item)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{item}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available Items</span>
              <Badge variant="secondary">
                {drugBatches?.length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Stock</span>
              <Badge variant="destructive">
                {drugBatches?.filter(batch => batch.quantity < 20).length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Categories</span>
              <Badge variant="outline">
                6
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-orange-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => setShowTransactionHistory(true)}
            >
              <Clock className="h-4 w-4 mr-2" />
              View Transaction History
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => setShowCustomerLookup(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Customer Lookup
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Daily Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Lookup Modal */}
      <CustomerLookup
        isOpen={showCustomerLookup}
        onClose={() => setShowCustomerLookup(false)}
        onSelectCustomer={(customer) => {
          console.log('Selected customer:', customer);
          // This would populate customer info in the POS
        }}
      />

      {/* Transaction History Modal */}
      <TransactionHistory
        isOpen={showTransactionHistory}
        onClose={() => setShowTransactionHistory(false)}
      />
    </div>
  );
}