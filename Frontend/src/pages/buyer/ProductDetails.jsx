import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetail, useAddToCart, useProductReviews, useCreateReview } from '../../api/hooks';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';
import { PrimaryButton } from '../../components/common/Button';
import { assets } from '../../assets/assets';
import { getProductImage, handleImgError } from '../../utils/productImage';
import { BasketIcon, CommentIcon, MessageIcon } from '../../assets/data/icons';
import toast from 'react-hot-toast';


export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProductDetail(id);

  const { data: reviews } = useProductReviews(id);
  const { mutate: addToCart, isPending } = useAddToCart();
  const { mutate: createReview, isPending: reviewPending } = useCreateReview(id);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  if (isLoading) return <SkeletonTableLoader />;
  const product = data?.data || data;
  if (!product) return <div className="text-center py-12"><img src={assets.basket_icon} alt="" className="mx-auto h-16 opacity-40 mb-3" /><p>Product not found</p></div>;
  const reviewsList = reviews?.data || reviews || [];
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-green-footer rounded-xl p-4 border border-green-border">
        <img src={getProductImage(product, 0)} alt={product.productName || product.name} onError={(e)=>handleImgError(e, 0)} className="w-full h-[380px] object-cover rounded-lg" />
      </div>
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">{product.productName || product.name}</h1>
        <div className="flex items-center gap-2 mb-3"><img src={assets.rating_starts} alt="rating" className="h-4" /><span className="text-sm text-gray-600">(122 reviews)</span></div>
        <p className="text-gray-600 mb-4 leading-relaxed">{product.productDescription || product.description}</p>
        <p className="text-primary font-bold text-2xl">Rs {product.productPrice || product.price}</p>
        <p className={`text-sm mb-6 ${product.productStock===0?'text-red-600 font-semibold':product.productStock<=5?'text-amber-600 font-semibold':'text-gray-500'}`}>{product.productStock===0?'Out of stock':product.productStock<=5?`Only ${product.productStock} left in stock — order soon`:`${product.productStock} in stock`}</p>
        <div className="flex flex-wrap gap-3 mb-6">
          <PrimaryButton label={product.productStock===0?'Out of stock':isPending ? 'Adding...' : 'Add to Cart'} disabled={product.productStock===0} loading={isPending} onClick={()=>addToCart({ productID: id }, { onSuccess: ()=>toast.success('Added to cart'), onError: (e)=>toast.error(e.response?.data?.message || 'Failed') })} />
          
          {(product.seller || product.userId) && (
            <button 
              onClick={() => {
                const sId = typeof product.seller === 'object' ? product.seller._id : (product.seller || product.userId);
                navigate(`/chat?userId=${sId}`);
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary border border-primary/30 hover:border-primary rounded-xl px-4 py-2.5 bg-green-50/50 hover:bg-green-100/50 transition shadow-xs"
            >
              <MessageIcon className="size-4 text-primary" /> Chat with Seller
            </button>
          )}

          <span className="inline-flex items-center gap-2 text-sm text-gray-600 border border-green-border rounded-xl px-4 py-2.5 bg-green-footer"><BasketIcon className="size-4 text-primary" /> Free delivery</span>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="font-semibold font-serif mb-3 flex items-center gap-2"><CommentIcon /> Reviews</h3>
          <div className="bg-gray-50 border border-green-border rounded-xl p-4 mb-4">
            <p className="text-sm font-medium mb-2">Write a review</p>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(n=> <button key={n} onClick={()=>setRating(n)} className={`text-xl ${n<=rating?'text-amber-500':'text-gray-300'}`}>★</button>)}
              <span className="text-xs text-gray-500 ml-2 self-center">{rating}/5</span>
            </div>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Share your experience..." rows={3} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
            <PrimaryButton label={reviewPending?'Submitting...':'Submit Review'} loading={reviewPending} className="mt-3" onClick={()=>{ if(!message.trim()) return toast.error('Please write a message'); createReview({ userRating: rating, userMessage: message }, { onSuccess: ()=>setMessage('')});}} />
          </div>
          {Array.isArray(reviewsList) && reviewsList.length > 0 ? (
            <ul className="space-y-3">
              {reviewsList.map((r, i)=>{
                const rev = r.rating ? r : (r.reviews?.[0] || r);
                const userName = r.userId?.email || r.userName || r.user || 'Anonymous';
                const avgFallback = product.reviews?.find(x=>x.userId===r.userId?._id);
                return (
                <li key={i} className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                  <p className="font-medium flex items-center gap-2">{userName} <span className="text-amber-500 text-xs">{'★'.repeat(r.rating||r.userRating||5)}</span></p>
                  <p className="text-gray-600 mt-1">{r.message || r.comment || r.review || r.text || (r.reviews ? JSON.stringify(r.reviews.slice(0,1)) : JSON.stringify(r)).slice(0,120)}</p>
                </li>
              );})}
            </ul>
          ) : product.reviews?.length ? (
            <ul className="space-y-3">{product.reviews.map((r,i)=>(<li key={i} className="bg-white border border-gray-200 rounded-lg p-3 text-sm"><p className="font-medium">{'★'.repeat(r.rating||5)} <span className="text-gray-400 text-xs">{new Date(r.createdAt||Date.now()).toLocaleDateString()}</span></p><p className="text-gray-600">{r.message}</p></li>))}</ul>
          ) : <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-dashed">No reviews yet. Be the first to review!</p>}
        </div>
      </div>
    </div>
  );
}
