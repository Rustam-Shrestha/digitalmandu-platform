import { useProducts } from '../../api/hooks';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { data, isLoading, error } = useProducts({ page: 1, limit: 20 });
  const navigate = useNavigate();
  if (isLoading) return <SkeletonTableLoader />;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;
  const products = data?.data || data?.products || [];
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition">
            <h2 className="font-semibold text-gray-900">{product.productName || product.name}</h2>
            <p className="text-sm text-gray-500 truncate">{product.productDescription || product.description}</p>
            <p className="text-green-600 font-bold mt-2">Rs {product.productPrice || product.price}</p>
            <button onClick={()=>navigate(`/product/${product._id}`)} className="mt-4 w-full bg-green-600 text-white py-2 rounded">View Details</button>
          </div>
        ))}
        {products.length===0 && <p className="text-gray-600">No products found.</p>}
      </div>
    </div>
  );
}
