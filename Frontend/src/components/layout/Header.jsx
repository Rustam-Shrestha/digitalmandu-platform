import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../common/Button';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { userRole, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded">☰</button>
          )}
          <h1 className="text-xl font-semibold text-gray-900 cursor-pointer" onClick={()=>navigate('/')}>Vintage Bite</h1>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">{user?.email || user?.userEmail || 'User'}</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{userRole.charAt(0).toUpperCase()+userRole.slice(1)}</span>
              <SecondaryButton label="Logout" onClick={async()=>{await logout(); navigate('/login');}} />
            </>
          ) : (
            <>
              <PrimaryButton label="Login" onClick={()=>navigate('/login')} />
              <SecondaryButton label="Register" onClick={()=>navigate('/register')} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
