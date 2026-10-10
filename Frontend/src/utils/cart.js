export function getCartProduct(item) {
  const p = item?.product;
  if (Array.isArray(p)) return p[0] || item;
  if (p && typeof p === 'object') return p;
  return item;
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
  if (Array.isArray(p) && p[0]?._id) return p[0]._id;
  if (p && typeof p === 'object' && p._id) return p._id;
  if (typeof p === 'string') return p;
  return item?.product ?? item?.productId ?? item?._id;
}
export function calcSubtotal(items) {
  return (items||[]).reduce((s,it) => s + getCartPrice(it) * (Number(it.quantity)||1), 0);
}
