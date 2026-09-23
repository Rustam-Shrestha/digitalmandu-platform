import { useCreateOrder, useInitiatePayment } from '../../api/hooks';
import { PrimaryButton } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutate: initiatePayment } = useInitiatePayment();
  const navigate = useNavigate();
  const handleOrder = () => {
    createOrder({}, { onSuccess: ()=> { toast.success('Order placed'); navigate('/orders'); }, onError: (e)=> toast.error(e.response?.data?.message||'Failed') });
  };
  const handleKhalti = () => {
    initiatePayment({}, { onSuccess: (res)=> { const url=res.data?.payment_url; if(url) window.location.href=url; }, onError: ()=>{} });
  };
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <PrimaryButton label="Place Order (COD)" loading={isPending} onClick={handleOrder} />
        <PrimaryButton label="Pay with Khalti" variant="secondary" onClick={handleKhalti} />
      </div>
    </div>
  );
}
