import { useUIStore } from '../../store/uiStore';
import { Link, useLocation } from 'react-router-dom';

const BUYER_NAV = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Cart', path: '/cart', icon: '🛒' },
  { name: 'Orders', path: '/orders', icon: '📦' },
  { name: 'Profile', path: '/profile', icon: '👤' },
];
const SELLER_NAV = [
  { name: 'Dashboard', path: '/seller', icon: '📊' },
  { name: 'Products', path: '/seller/products', icon: '📦' },
  { name: 'Orders', path: '/seller/orders', icon: '🎯' },
  { name: 'Analytics', path: '/seller/analytics', icon: '📈' },
];
const ADMIN_NAV = [
  { name: 'Dashboard', path: '/admin', icon: '👑' },
  { name: 'Users', path: '/admin/users', icon: '👥' },
  { name: 'Products', path: '/admin/products', icon: '📦' },
  { name: 'Orders', path: '/admin/orders', icon: '📋' },
];

export default function Sidebar() {
  const { userRole } = useUIStore();
  const { pathname } = useLocation();
  const map = { buyer: BUYER_NAV, seller: SELLER_NAV, admin: ADMIN_NAV };
  const nav = map[userRole] || BUYER_NAV;
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6">
      <nav className="space-y-2">
        {nav.map((item) => (
          <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname===item.path ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
            <span>{item.icon}</span><span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
