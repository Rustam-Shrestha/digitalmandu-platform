import { useCart } from '../../api/hooks';
import { PrimaryButton } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';

export default function Cart() {
  const { data, isLoading } = useCart();
  const navigate = useNavigate();
  if (isLoading) return <SkeletonTableLoader />;
  const items = data?.data || data?.items || [];
  if (!items.length) return <div className="text-center py-12"><p className="text-gray-600 mb-4">Your cart is empty</p><PrimaryButton label="Continue Shopping" onClick={()=>navigate('/')} /></div>;
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id || item.productId} className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="font-semibold">{item.productName || item.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 h-fit">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <PrimaryButton label="Proceed to Checkout" className="w-full justify-center" onClick={()=>navigate('/checkout')} />
        </div>
      </div>
    </div>
  );
}
