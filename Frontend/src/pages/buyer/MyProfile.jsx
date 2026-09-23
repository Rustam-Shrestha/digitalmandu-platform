import { useAuthStore } from '../../store/authStore';

export default function MyProfile() {
  const { user } = useAuthStore();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">Email: {user?.email || user?.userEmail || 'N/A'}</p>
        <p className="text-sm text-gray-600">Name: {user?.userName || user?.name || 'N/A'}</p>
        <pre className="text-xs bg-gray-50 p-4 rounded mt-4">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}
