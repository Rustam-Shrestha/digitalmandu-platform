import { useOrders } from '../../api/hooks';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';
import { PackageIcon, LocationIcon } from '../../assets/data/icons';

export default function MyOrders() {
  const { data, isLoading, error } = useOrders();
  if (isLoading) return <SkeletonTableLoader />;
  if (error) return <p className="text-red-600">{error.message}</p>;
  const orders = data?.data || data || [];
  return (
    <div>
      <h1 className="text-3xl font-bold font-serif mb-6 flex items-center gap-2"><PackageIcon /> My Orders</h1>
      {orders.length===0 ? <p className="text-gray-600 border border-dashed p-6 rounded-xl bg-gray-50">No orders yet. Place an order from cart.</p> : orders.map((o)=>(
        <div key={o._id} className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Order #{String(o._id).slice(-8)} <span className="text-xs font-normal text-gray-500">{new Date(o.createdAt).toLocaleString()}</span></p>
              <p className="text-sm text-gray-500 flex flex-wrap gap-1 items-center mt-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">{o.orderStatus || o.status || 'pending'}</span>
                <span>· {o.paymentDetails?.method || 'cod'} · {o.paymentDetails?.status || 'pending'}</span>
                {o.tracking?.courier && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border">courier: {o.tracking.courier}</span>}
                {o.tracking?.trackingNumber && <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 text-xs border">{o.tracking.trackingNumber} {o.tracking?.estimatedDelivery ? `· ETA ${new Date(o.tracking.estimatedDelivery).toLocaleDateString()}` : ''}</span>}
                {o.invoice?.invoiceNumber && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs border">inv {o.invoice.invoiceNumber}</span>}
                {o.refund?.requested && <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs border">refund {o.refund.status}</span>}
              </p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1"><LocationIcon className="size-4 text-gray-400" /> Ship to: {o.shippingAddress || o.address?.street || '—'}</p>
              {o.items?.length ? <p className="text-xs text-gray-500 mt-2">{o.items.length} items: {o.items.map(it=> `${it.product?.productName||it.product?.name||it.product} x${it.quantity}`).join(', ')}</p> : null}
            </div>
            <p className="font-bold text-primary text-lg shrink-0">Rs {o.totalAmount ?? o.totalPrice ?? 0}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
