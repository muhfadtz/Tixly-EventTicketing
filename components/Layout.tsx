import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../services/firebase';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // @ts-ignore
    window.lucide?.createIcons();
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <i data-lucide="sun" className="h-5 w-5"></i>
      ) : (
        <i data-lucide="moon" className="h-5 w-5"></i>
      )}
    </button>
  );
};


const Layout: React.FC = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };
  
  useEffect(() => {
    // @ts-ignore
    window.lucide?.createIcons();
  });

  const closeMenu = () => setIsMobileMenuOpen(false);

  const NavLink: React.FC<{ to: string, children: React.ReactNode}> = ({ to, children }) => (
    <Link to={to} onClick={closeMenu} className="text-foreground/70 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium">
      {children}
    </Link>
  );
  
  const MobileNavLink: React.FC<{ to: string, children: React.ReactNode}> = ({ to, children }) => (
     <Link to={to} onClick={closeMenu} className="block text-foreground/70 hover:text-foreground hover:bg-accent px-3 py-2 rounded-md text-base font-medium">
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" onClick={closeMenu} className="text-2xl font-bold text-primary">
                Tixly
              </Link>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/events">Acara</NavLink>
                  {appUser?.role === 'peserta' && <NavLink to="/my-tickets">Tiket Saya</NavLink>}
                  {appUser?.role === 'panitia' && <NavLink to="/panitia/dashboard">Dashboard</NavLink>}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
                {appUser ? (
                  <>
                    <span className="text-foreground/80 text-sm">Hi, {appUser.namaLengkap}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/80 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <div className="space-x-2">
                    <Link to="/login" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium">
                      Masuk
                    </Link>
                     <Link to="/register" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium">
                      Daftar
                    </Link>
                  </div>
                )}
                 <ThemeToggle />
            </div>
             <div className="-mr-2 flex md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Buka menu utama</span>
                {isMobileMenuOpen ? (
                  <i data-lucide="x" className="block h-6 w-6"></i>
                ) : (
                  <i data-lucide="menu" className="block h-6 w-6"></i>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-border`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <MobileNavLink to="/events">Acara</MobileNavLink>
             {appUser?.role === 'peserta' && <MobileNavLink to="/my-tickets">Tiket Saya</MobileNavLink>}
             {appUser?.role === 'panitia' && <MobileNavLink to="/panitia/dashboard">Dashboard</MobileNavLink>}
          </div>
          <div className="pt-4 pb-3 border-t border-border">
            <div className="px-5 space-y-3">
              {appUser ? (
                <>
                  <p className="font-medium text-foreground">Masuk sebagai {appUser.namaLengkap}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block bg-destructive text-destructive-foreground hover:bg-destructive/80 px-4 py-2 rounded-md text-base font-medium"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                   <Link to="/login" onClick={closeMenu} className="block text-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-base font-medium">
                      Masuk
                    </Link>
                     <Link to="/register" onClick={closeMenu} className="block text-center bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-base font-medium">
                      Daftar
                    </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;