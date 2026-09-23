import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifyPayment } from '../../api/hooks';

export default function KhaltiSuccess() {
  const [searchParams] = useSearchParams();
  const { mutate: verifyPayment } = useVerifyPayment();
  const navigate = useNavigate();
  useEffect(() => {
    const pidx = searchParams.get('pidx');
    if (pidx) verifyPayment({ pidx }, { onSuccess: () => navigate('/orders') });
  }, [searchParams, verifyPayment, navigate]);
  return <div className="text-center py-12">Processing payment...</div>;
}
