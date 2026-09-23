import { useCreateOrder, useInitiatePayment } from '../../api/hooks';
import { PrimaryButton } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';
import { PackageIcon } from '../../assets/data/icons';

export default function Checkout() {
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutate: initiatePayment } = useInitiatePayment();
  const navigate = useNavigate();
  const handleOrder = () => {
    createOrder({}, { onSuccess: ()=> { toast.success('Order placed'); navigate('/orders'); }, onError: (e)=> toast.error(e.response?.data?.message||'Failed') });
  };
  const handleKhalti = () => {
    initiatePayment({}, { onSuccess: (res)=> { const url=res.data?.payment_url; if(url) window.location.href=url; else toast.error('No payment URL'); }, onError: (e)=> toast.error(e.response?.data?.message || 'Payment failed') });
  };
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-serif text-primary mb-6 flex items-center gap-3"><img src={assets.parcel_icon} alt="" className="h-7" /> Checkout</h1>
      <div className="bg-white p-6 rounded-xl border border-green-border shadow-sm space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-footer rounded-lg border border-green-border">
          <PackageIcon className="size-6 text-primary" />
          <div><p className="font-semibold text-gray-900">Delivery Address</p><p className="text-sm text-gray-600">Your default delivery address will be used. Update in profile if needed.</p></div>
        </div>
        <div className="grid gap-3">
          <PrimaryButton label="Place Order (Cash on Delivery)" loading={isPending} onClick={handleOrder} />
          <PrimaryButton label="Pay with Khalti" variant="secondary" onClick={handleKhalti} />
        </div>
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2"><img src={assets.bag_icon} alt="" className="h-4" /> Secure checkout powered by Khalti</p>
      </div>
    </div>
  );
}
