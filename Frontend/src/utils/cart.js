export function getCartProduct(item) {
  return item?.product && typeof item.product === 'object' ? item.product : item;
}
export function getCartPrice(item) {
  const p = getCartProduct(item);
  return Number(p?.productPrice ?? p?.price ?? item?.productPrice ?? 0);
}
export function getCartName(item) {
  const p = getCartProduct(item);
  return p?.productName ?? p?.name ?? item?.productName ?? 'Item';
}
export function getCartProductId(item) {
  const p = item?.product;
  if (p && typeof p === 'object' && p._id) return p._id;
  if (typeof p === 'string') return p;
  return item?.product ?? item?.productId ?? item?._id;
}
export function calcSubtotal(items) {
  return (items||[]).reduce((s,it) => s + getCartPrice(it) * (Number(it.quantity)||1), 0);
}
