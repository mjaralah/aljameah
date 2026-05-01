import { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  FolderKanban,
  Users,
  Handshake,
  Image as ImageIcon,
  Settings,
  UserCog,
  LogOut,
  Shield,
  Menu,
  HandHeart,
  IdCard,
  MessageSquare,
  ThumbsUp,
  FileText,
  ScrollText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const contentItems: NavItem[] = [
  { to: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/admin/news", label: "الأخبار", icon: Newspaper },
  { to: "/admin/programs", label: "البرامج", icon: FolderKanban },
  { to: "/admin/pages", label: "الصفحات", icon: FileText },
  { to: "/admin/board", label: "مجلس الإدارة", icon: Users },
  { to: "/admin/partners", label: "الشركاء", icon: Handshake },
  { to: "/admin/hero", label: "شريط البطل", icon: ImageIcon },
  { to: "/admin/governance", label: "ملفات الحوكمة", icon: ScrollText },
];

const requestsItems: NavItem[] = [
  { to: "/admin/volunteer-requests", label: "طلبات التطوع", icon: HandHeart },
  { to: "/admin/membership-requests", label: "طلبات العضوية", icon: IdCard },
  { to: "/admin/contact-messages", label: "رسائل التواصل", icon: MessageSquare },
  { to: "/admin/feedback", label: "تقييمات الصفحات", icon: ThumbsUp },
];

const settingsItems: NavItem[] = [
  { to: "/admin/settings", label: "الإعدادات العامة", icon: Settings, adminOnly: true },
  { to: "/admin/users", label: "المستخدمون والأدوار", icon: UserCog, adminOnly: true },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { user, role, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);

  const renderItem = (item: NavItem) => {
    if (item.adminOnly && role !== "admin") return null;
    return (
      <SidebarMenuItem key={item.to}>
        <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
          <NavLink
            to={item.to}
            end={item.to === "/admin"}
            className={cn(
              "flex items-center gap-3 transition-colors",
              isActive(item.to)
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted/60",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  async function handleLogout() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  const initials = (user?.email ?? "م").charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 shrink-0">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">لوحة التحكم</p>
              <p className="text-xs text-muted-foreground truncate">إدارة الموقع</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>المحتوى</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>{contentItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === "admin" && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>الإعدادات</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>{settingsItems.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2 space-y-2">
          <div className={cn("flex items-center gap-2 px-2 py-2 rounded-lg bg-muted/40", collapsed && "justify-center")}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{user?.email}</p>
                <p className="text-[10px] text-muted-foreground">
                  {role === "admin" ? "مدير" : "محرر"}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 ml-2" />
            {!collapsed && "تسجيل الخروج"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminLayout({ children, title, description, actions }: {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <div dir="rtl" className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-background/95 backdrop-blur px-4 sticky top-0 z-30">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div className="min-w-0 flex-1">
              {title && <h1 className="text-base font-semibold truncate">{title}</h1>}
              {description && (
                <p className="text-xs text-muted-foreground truncate">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
