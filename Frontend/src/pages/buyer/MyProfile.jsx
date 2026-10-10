import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../api/endpoints/user';
import { ProfileIcon, EmailIcon, GroupUserIcon, CrownIcon, LocationIcon, EditIcon, CheckMarkIcon } from '../../assets/data/icons';

export default function MyProfile() {
  const { user } = useAuthStore();
  const { userRole } = useUIStore();
  const userId = user?._id || user?.id;
  const { data: fresh, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userAPI.getProfile(userId).then(r=>r.data),
    enabled: !!userId,
  });
  const u = fresh?.data || fresh?.user || user || {};
  const email = u.email || u.userEmail || '—';
  const name = u.name || u.userName || '—';
  const phone = u.phone || u.userPhone || '—';
  const role = u.role || (userRole==='seller' ? 'seller' : userRole) || 'customer';
  const bio = u.bio || null;
  const seller = u.sellerProfile || null;
  const pref = u.preferences || null;

  if (isLoading) return <div className="max-w-3xl mx-auto text-sm text-gray-500">Loading profile…</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-serif flex items-center gap-2"><ProfileIcon size={24} /> My Profile</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-green-footer border-b border-green-border p-6 flex items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-white border-2 border-green-border flex items-center justify-center text-primary shrink-0"><ProfileIcon size={36} /></span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{name}</h2>
            <p className="text-sm text-gray-600 flex items-center gap-1.5 truncate"><EmailIcon /> {email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-green-border text-primary px-3 py-1 rounded-full font-medium capitalize"><GroupUserIcon /> {role}</span>
              {u.isOtpVerified && <span className="inline-flex items-center gap-1 text-xs bg-white border text-emerald-700 px-2 py-1 rounded-full"><CheckMarkIcon /> verified</span>}
            </div>
          </div>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><ProfileIcon size={14} /> Full Name</p><p className="font-medium mt-1">{name}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><EmailIcon /> Email</p><p className="font-medium mt-1 break-all">{email}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><GroupUserIcon /> Phone</p><p className="font-medium mt-1">{phone}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><LocationIcon /> Member Since</p><p className="font-medium mt-1">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</p></div>
          {bio && <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><EditIcon /> Bio</p><p className="font-medium mt-1">{bio}</p></div>}
          {u.lastLogin && <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Last Login</p><p className="font-medium mt-1">{new Date(u.lastLogin).toLocaleString()}</p></div>}
          {pref && <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Preferences</p><p className="font-medium mt-1 text-sm">{pref.language || 'en'} · {pref.notifications ? 'Notifications on' : 'Notifications off'} · {pref.newsletter ? 'Newsletter' : 'No newsletter'}</p></div>}
        </div>
        {seller && (
          <div className="px-6 pb-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><CrownIcon /> Seller Profile</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Shop Name</p><p className="font-medium mt-1">{seller.shopName || '—'}</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Rating</p><p className="font-medium mt-1">{seller.rating ?? 0} / 5</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Total Sales</p><p className="font-medium mt-1">Rs {seller.totalSales ?? 0}</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Verified</p><p className="font-medium mt-1">{seller.isVerified ? 'Verified' : 'Not verified'}</p></div>
              {seller.shopDescription && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:col-span-2"><p className="text-xs text-gray-500 uppercase">Shop Description</p><p className="font-medium mt-1">{seller.shopDescription}</p></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
