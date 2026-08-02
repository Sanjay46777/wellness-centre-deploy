import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LogOut, User, Moon, Sun, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { WELLNESS_CENTRE_LOGO_URL } from '@/lib/assets';

export function Navbar() {
  const { user, logout, isRole } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const navItems = [
    { label: 'Home', href: '/', public: true },
    { label: 'Feedback', href: '/feedback', roles: ['student'] },
    { label: 'Dashboard', href: '/student/home', roles: ['student'] },
    { label: 'Counsellor Dashboard', href: '/head/dashboard', roles: ['head_counsellor'] },
    { label: 'Admin Dashboard', href: '/admin/dashboard', roles: ['admin'] },
    { label: 'Manage Counsellors', href: '/admin/counsellors', roles: ['admin', 'head_counsellor'] },
    { label: 'Manage Students', href: '/admin/students', roles: ['admin', 'head_counsellor'] },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.public) return true;
    if (!user) return false;
    return item.roles?.some((r) => isRole(r as any));
  });

  const isActive = (href: string) => location.pathname === href;

  const homeHref = isRole('admin')
    ? '/admin/dashboard'
    : isRole('head_counsellor')
      ? '/head/dashboard'
      : '/student/home';

  const initials = (user?.full_name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-tight section-padding flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={WELLNESS_CENTRE_LOGO_URL}
            alt="Wellness Centre"
            className="h-8 w-auto object-contain"
          />
          <span className="font-playfair-display text-xl font-bold tracking-tight">Wellness Centre</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-foreground',
                isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-muted"
                  aria-label="Account menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:block">{user.full_name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={homeHref}>
                    <Settings className="mr-2 h-4 w-4" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/role-select">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <div className="flex flex-col gap-6 pt-6">
              <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <img
                  src={WELLNESS_CENTRE_LOGO_URL}
                  alt="Wellness Centre"
                  className="h-8 w-auto object-contain"
                />
                <span className="font-playfair-display text-xl font-bold">Wellness Centre</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'text-base font-medium transition-colors',
                      isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="h-4 w-4" /> Edit Profile
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={() => { logout(); setOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/role-select" onClick={() => setOpen(false)}>
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={toggleTheme} className="justify-start gap-2">
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Toggle theme
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
