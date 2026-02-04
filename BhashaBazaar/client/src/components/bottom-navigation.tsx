import { Home, ShoppingCart, Package, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/hooks/use-language';
import { getTranslation } from '@/lib/i18n';

export function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { language } = useLanguage();

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: getTranslation(language, 'nav.home'),
      active: location === '/' 
    },
    { 
      path: '/buy-ingredients', 
      icon: ShoppingCart, 
      label: getTranslation(language, 'nav.buy'),
      active: location === '/buy-ingredients' 
    },
    { 
      path: '/inventory', 
      icon: Package, 
      label: getTranslation(language, 'nav.inventory'),
      active: location === '/inventory' 
    },
    { 
      path: '/profile', 
      icon: User, 
      label: getTranslation(language, 'nav.profile'),
      active: location === '/profile' 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto z-40">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 transition-colors duration-200 ${
                item.active 
                  ? 'text-saffron' 
                  : 'text-gray-400 hover:text-saffron'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
