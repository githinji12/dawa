import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "danger";
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary text-primary-foreground",
    success: "bg-green-500 text-white",
    warning: "bg-orange-500 text-white",
    danger: "bg-red-500 text-white"
  };

  return (
    <Card className="stat-card">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`rounded-full p-3 mr-4 ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold">{value}</h4>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
