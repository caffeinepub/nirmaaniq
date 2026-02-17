import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { getRoleLabel } from '../../lib/roles';

export default function TopNav() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate({ to: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Projects', path: '/projects' },
    { label: 'Daily Logs', path: '/daily-logs' },
    { label: 'Planning', path: '/planning' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Reports', path: '/reports' },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          onClick={() => {
            navigate({ to: item.path });
            if (mobile) setIsOpen(false);
          }}
          className={mobile ? 'w-full justify-start' : ''}
        >
          {item.label}
        </Button>
      ))}
    </>
  );

  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/nirmaaniq-logo.dim_512x128.png" 
              alt="NirmaanIQ" 
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-4">
            {userProfile && (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-sm text-right">
                  <p className="font-medium text-foreground">{userProfile.fullName}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(userProfile.role)}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate({ to: '/profile' })}
                  className="shrink-0"
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {userProfile && (
                    <div className="pb-4 border-b">
                      <p className="font-medium text-foreground">{userProfile.fullName}</p>
                      <p className="text-sm text-muted-foreground mt-1">{userProfile.phone}</p>
                      <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {getRoleLabel(userProfile.role)}
                      </span>
                    </div>
                  )}
                  <nav className="flex flex-col gap-2">
                    <NavLinks mobile />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate({ to: '/profile' });
                        setIsOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      My Profile
                    </Button>
                  </nav>
                  <Button variant="destructive" onClick={handleLogout} className="w-full mt-4">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
