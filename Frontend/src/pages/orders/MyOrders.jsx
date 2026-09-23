import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../../store/checkoutSlice';

const MyOrders = () => {
    const dispatch = useDispatch();
    const { data, status } = useSelector((state) => state.checkout);

    console.log("Fetched Orders:", data); // Debugging

    useEffect(() => {
        dispatch(fetchOrder());
    }, []);
    useEffect(() => {
        console.log("Fetched Orders:", data);
    }, [data]);

    // Ensure orders exist and are properly structured
    const orders = data;

    return (
        <div className="antialiased font-sans bg-gray-200 pt-20">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="py-8">
                    <h2 className="text-2xl font-semibold leading-tight">My Orders</h2>
                    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                            {status === 'loading' ? (
                                <p className="text-center p-4">Loading...</p>
                            ) : orders.length > 0 ? (
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Total Amount</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Shipping Address Amount</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Payment Status</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Order Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {orders.map((order) => (
    <tr key={order._id}>
        <td>{order._id || 'N/A'}</td>
        <td>Rs. {order.totalAmount || 'N/A'}</td>
        <td>{order.shippingAddress || 'N/A'}</td>
        <td>{order.paymentDetails?.status || 'N/A'}</td>
        <td>{order.orderStatus || 'Pending'}</td>
    </tr>
))}


                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center p-4">No orders found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
