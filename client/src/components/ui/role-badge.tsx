import { Badge } from "@/components/ui/badge";
import { Crown, UserCheck, User } from "lucide-react";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return {
          icon: Crown,
          label: 'Admin',
          variant: 'default' as const,
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'pharmacist':
        return {
          icon: UserCheck,
          label: 'Pharmacist',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'cashier':
        return {
          icon: User,
          label: 'Cashier',
          variant: 'outline' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return {
          icon: User,
          label: 'User',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}