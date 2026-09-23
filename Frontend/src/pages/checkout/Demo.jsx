// import React from 'react'
import { useSelector } from 'react-redux';

const Demo = () => {
    const orders = useSelector((state) => state.checkout.data);
    const status = useSelector((state) => state.checkout.status);

    console.log('Orders:', orders);
    console.log('Status:', status);
    // const items = useSelector((state) => state.cart.items);
    // const status = useSelector((state) => state.cart.status);

    // console.log('Cart Items:', items);
    // console.log('Status:', status); 

  return (
    <div>Demo</div>
  )
}

export default Demo