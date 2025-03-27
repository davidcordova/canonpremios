import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard,
  User,
  ShoppingCart,
  Package,
  Receipt,
  GraduationCap,
  Gift,
  Trophy,
  FileText,
  HelpCircle,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Star,
  Building2
} from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

const categoryColors = {
  bronce: 'bg-amber-100 text-amber-800',
  plata: 'bg-gray-100 text-gray-800',
  oro: 'bg-yellow-100 text-yellow-800',
  diamante: 'bg-blue-100 text-blue-800'
};

const categoryNames = {
  bronce: 'Bronce',
  plata: 'Plata',
  oro: 'Oro',
  diamante: 'Diamante'
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Definir menú base según el rol
  const getMenuItems = () => {
    const baseItems = [
      { path: '/', icon: LayoutDashboard, label: 'Panel Principal' },
      { path: '/profile', icon: User, label: 'Perfil' },
      { path: '/purchases', icon: ShoppingCart, label: 'Compras' },
      { path: '/stock', icon: Package, label: 'Stock' },
      { path: '/sales', icon: Receipt, label: 'Ventas' },
      { path: '/training', icon: GraduationCap, label: 'Capacitación' },
      { path: '/rewards', icon: Gift, label: 'Premios' },
      { path: '/winners', icon: Trophy, label: 'Ganadores' },
      { path: '/documentation', icon: FileText, label: 'Documentación' },
      { path: '/guide', icon: HelpCircle, label: 'Guía' }
    ];

    // Si es admin, agregar opciones adicionales
    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { path: '/products', icon: Package, label: 'Productos' },
        { path: '/users', icon: Users, label: 'Usuarios' },
        { path: '/companies', icon: Building2, label: 'Empresas' }
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCompactMode = () => {
    setIsCompact(!isCompact);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <img
                src="https://www.canon.es/media/Canon_logo_500_tcm86-1117891.jpg"
                alt="Canon Logo"
                className="h-8"
              />
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'seller' && (
                <div className="hidden md:flex items-center gap-3 pr-4 border-r">
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">{user.points} pts</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[user.category || 'bronce']}`}>
                    {categoryNames[user.category || 'bronce']}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Link to="/profile" className="block">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    title="Ver perfil"
                  />
                </Link>
                <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0
            bg-white shadow-sm
            min-h-[calc(100vh-4rem)] mt-16 lg:mt-0
            transition-all duration-200
            ${isMobile ? (
              isMobileMenuOpen ? 'translate-x-0 z-40' : '-translate-x-full'
            ) : (
              isCompact ? 'w-16' : 'w-64'
            )}
          `}
        >
          <div className="flex flex-col h-full">
            <div className="hidden lg:flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCompactMode}
                className="text-gray-500 hover:text-gray-700"
              >
                {isCompact ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto flex-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md ${
                      location.pathname === item.path
                        ? 'bg-[#D61F26] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={isCompact ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCompact && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay para menú móvil */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main 
          className={`
            flex-1 p-4 sm:p-6 lg:p-8 
            transition-all duration-200
            w-full
            overflow-x-hidden
          `}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}