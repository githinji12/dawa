import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Pill, 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  BarChart3, 
  Users, 
  Handshake, 
  Settings, 
  LogOut,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/role-badge";
import { AuthUser } from "@/lib/types";

interface SidebarProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [location] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const getMenuItems = () => {
    const baseItems = [
      { path: "/", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/sales", icon: ShoppingCart, label: "Sales (POS)" },
      { path: "/inventory", icon: Package, label: "Inventory", hasAlert: true },
      { path: "/customers", icon: Users, label: "Customers" },
    ];

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { path: "/categories", icon: FolderOpen, label: "Categories" },
        { path: "/purchases", icon: Truck, label: "Purchases" },
        { path: "/suppliers", icon: Handshake, label: "Suppliers" },
        { path: "/reports", icon: BarChart3, label: "Reports" },
        { path: "/settings", icon: Settings, label: "Settings" },
      ];
    } else if (user.role === 'cashier') {
      return baseItems;
    } else {
      // Pharmacist role
      return [
        ...baseItems,
        { path: "/purchases", icon: Truck, label: "Purchases" },
        { path: "/suppliers", icon: Handshake, label: "Suppliers" },
        { path: "/reports", icon: BarChart3, label: "Reports" },
      ];
    }
  };

  const filteredMenuItems = getMenuItems();

  return (
    <div className="w-64 sidebar">
      <div className="logo-section">
        <div className="flex items-center justify-center">
          <Pill className="h-8 w-8 text-white mr-2" />
          <div>
            <h5 className="text-white font-bold text-lg">PharmaCare</h5>
            <small className="text-white/70">POS System</small>
          </div>
        </div>
      </div>

      <div className="user-profile">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={user.profileImageUrl} alt={user.username} />
            <AvatarFallback>
              {user.firstName?.[0] || user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-white font-medium">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username
              }
            </div>
            <div className="mt-1">
              <RoleBadge role={user.role} className="text-xs" />
            </div>
          </div>
        </div>
      </div>

      <nav className="px-3 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start sidebar-nav-link ${
                  isActive ? 'active' : ''
                } ${item.hasAlert ? 'alert-indicator' : ''}`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
        
        <hr className="border-white/20 my-4" />
        
        <Button
          variant="ghost"
          className="w-full justify-start sidebar-nav-link"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </nav>
    </div>
  );
}
