import { useParams } from 'react-router-dom';
import { useProductDetail, useAddToCart, useProductReviews } from '../../api/hooks';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';
import { PrimaryButton } from '../../components/common/Button';

export default function ProductDetails() {
  const { id } = useParams();
  const { data, isLoading } = useProductDetail(id);
  const { data: reviews } = useProductReviews(id);
  const { mutate: addToCart, isPending } = useAddToCart();
  if (isLoading) return <SkeletonTableLoader />;
  const product = data?.data || data;
  if (!product) return <p>Product not found</p>;
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{product.productName || product.name}</h1>
      <p className="text-gray-600 mb-4">{product.productDescription || product.description}</p>
      <p className="text-green-600 font-bold text-xl mb-4">Rs {product.productPrice || product.price}</p>
      <PrimaryButton label={isPending ? 'Adding...' : 'Add to Cart'} loading={isPending} onClick={()=>addToCart({ productID: id })} />
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Reviews</h3>
        <pre className="text-sm bg-gray-50 p-4 rounded">{JSON.stringify(reviews?.data || reviews || [], null, 2)}</pre>
      </div>
    </div>
  );
}
