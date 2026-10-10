import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from './endpoints/products';
import { cartAPI } from './endpoints/cart';
import { ordersAPI } from './endpoints/orders';
import { paymentAPI } from './endpoints/payment';
import { reviewsAPI } from './endpoints/reviews';
import { addressesAPI } from './endpoints/addresses';
import { chatAPI } from './endpoints/chat';
import toast from 'react-hot-toast';

export const useProducts = (params) => useQuery({ queryKey: ['products', params], queryFn: () => productsAPI.getList(params).then(r=>r.data), staleTime: 5*60*1000 });
export const useProductDetail = (id, enabled=true) => useQuery({ queryKey: ['product', id], queryFn: () => productsAPI.getDetail(id).then(r=>r.data), enabled: !!id && enabled, staleTime: 10*60*1000 });
export const useProductSearch = (query) => useQuery({ queryKey: ['products-search', query], queryFn: () => productsAPI.search(query).then(r=>r.data), enabled: !!query, staleTime: 3*60*1000 });
export const useProductReviews = (productId) => useQuery({ queryKey: ['reviews', productId], queryFn: () => reviewsAPI.getByProduct(productId).then(r=>r.data), enabled: !!productId });
export const useCreateReview = (productId) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data)=>reviewsAPI.create(productId, data), onSuccess: ()=>{qc.invalidateQueries({queryKey:['reviews', productId]}); qc.invalidateQueries({queryKey:['product', productId]}); toast.success('Review submitted');}, onError:(e)=>toast.error(e.response?.data?.message||'Failed to submit review')});
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data) => productsAPI.create(data), onSuccess: () => { qc.invalidateQueries({queryKey:['products']}); toast.success('Product created'); }, onError: (e)=> toast.error(e.response?.data?.message||'Failed to create') });
};
export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({id,data}) => productsAPI.update(id,data), onSuccess: ()=>{qc.invalidateQueries({queryKey:['products']}); toast.success('Product updated');}, onError:(e)=>toast.error(e.response?.data?.message||'Failed to update')});
};
export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id)=>productsAPI.delete(id), onSuccess: ()=>{qc.invalidateQueries({queryKey:['products']}); toast.success('Product deleted');}, onError:(e)=>toast.error(e.response?.data?.message||'Failed to delete')});
};

export const useCart = () => useQuery({ queryKey: ['cart'], queryFn: () => cartAPI.getCart().then(r=>r.data) });
export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({productID, data})=>cartAPI.addItem(productID, data), onSuccess: ()=>{qc.invalidateQueries({queryKey:['cart']}); toast.success('Added to cart');}, onError:(e)=>toast.error(e.response?.data?.message||'Failed to add')});
};
export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (cartID)=>cartAPI.removeItem(cartID), onSuccess: ()=>qc.invalidateQueries({queryKey:['cart']})});
};
export const useUpdateCartItem = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({cartID, data})=>cartAPI.updateItem(cartID, data), onSuccess: ()=>qc.invalidateQueries({queryKey:['cart']})});
};

export const useOrders = () => useQuery({ queryKey: ['orders'], queryFn: ()=>ordersAPI.getOrders().then(r=>r.data) });
export const useOrderDetail = (id, enabled=true) => useQuery({ queryKey: ['order', id], queryFn: ()=>ordersAPI.getDetail(id).then(r=>r.data), enabled: !!id && enabled });
export const useCreateOrder = () => {
  const qc=useQueryClient();
  return useMutation({ mutationFn:(data)=>ordersAPI.create(data), onSuccess:()=>{qc.invalidateQueries({queryKey:['orders']});toast.success('Order created');}, onError:(e)=>toast.error(e.response?.data?.message||'Failed to create order')});
};
export const useCancelOrder = () => {
  const qc=useQueryClient();
  return useMutation({ mutationFn:(data)=>ordersAPI.cancel(data), onSuccess:()=>{qc.invalidateQueries({queryKey:['orders']});toast.success('Order cancelled');}});
};
export const useUpdateOrderStatus = () => {
  const qc=useQueryClient();
  return useMutation({ mutationFn:({id,status})=>ordersAPI.updateStatus(id,status), onSuccess:()=>{qc.invalidateQueries({queryKey:['orders']});toast.success('Order updated');}});
};

export const useInitiatePayment = () => useMutation({ mutationFn:(data)=>paymentAPI.initiate(data), onError:(e)=>toast.error(e.response?.data?.message||'Payment failed')});
export const useVerifyPayment = () => {
  const qc=useQueryClient();
  return useMutation({ mutationFn:(data)=>paymentAPI.verify(data), onSuccess:()=>{qc.invalidateQueries({queryKey:['orders']});toast.success('Payment verified');}, onError:(e)=>toast.error(e.response?.data?.message||'Verification failed')});
};

export const useAddresses = () => useQuery({ queryKey:['addresses'], queryFn:()=>addressesAPI.list().then(r=>r.data) });
export const useCreateAddress = () => { const qc=useQueryClient(); return useMutation({ mutationFn:(d)=>addressesAPI.create(d), onSuccess:()=>{qc.invalidateQueries({queryKey:['addresses']}); toast.success('Address saved');}, onError:(e)=>toast.error(e.response?.data?.message||'Failed')}); };
export const useUpdateAddress = () => { const qc=useQueryClient(); return useMutation({ mutationFn:({id,data})=>addressesAPI.update(id,data), onSuccess:()=>qc.invalidateQueries({queryKey:['addresses']})}); };
export const useDeleteAddress = () => { const qc=useQueryClient(); return useMutation({ mutationFn:(id)=>addressesAPI.remove(id), onSuccess:()=>qc.invalidateQueries({queryKey:['addresses']})}); };
export const useSetDefaultAddress = () => { const qc=useQueryClient(); return useMutation({ mutationFn:(id)=>addressesAPI.setDefault(id), onSuccess:()=>qc.invalidateQueries({queryKey:['addresses']})}); };

export const useChats = () => useQuery({ queryKey:['chats'], queryFn:()=>chatAPI.getChats().then(r=>r.data?.data || r.data) });
export const useChatContacts = () => useQuery({ queryKey:['chatContacts'], queryFn:()=>chatAPI.getContacts().then(r=>r.data?.data || r.data) });
export const useChatMessages = (chatId) => useQuery({ queryKey:['chatMessages', chatId], queryFn:()=>chatAPI.getMessages(chatId).then(r=>r.data?.messages || r.data?.data?.messages || []), enabled: !!chatId });
export const useGetOrCreateChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ targetUserId, orderId }) => chatAPI.getOrCreate(targetUserId, orderId).then(r => r.data?.data || r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats'] }),
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to initialize chat')
  });
};
export const useSendMessage = (chatId) => { 
  const qc = useQueryClient(); 
  return useMutation({ 
    mutationFn: (d) => chatAPI.sendMessage(chatId, d), 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      qc.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to send message')
  }); 
};
export const useMarkChatRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatId) => chatAPI.markRead(chatId),
    onSuccess: (_, chatId) => {
      qc.invalidateQueries({ queryKey: ['chats'] });
      qc.invalidateQueries({ queryKey: ['chatMessages', chatId] });
    }
  });
};
