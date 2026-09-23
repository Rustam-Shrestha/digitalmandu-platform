import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createOrder } from "../../store/checkoutSlice";
import { STATUSES } from "../../globals/miscellanouous/statuses";
// import { current } from "@reduxjs/toolkit";
import { APIForAuthenticated } from "../../http";


const CheckOut = () => {
    const { items: products } = useSelector((state) => state.cart);
    const { status, data } = useSelector((state) => state.checkout);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState } = useForm();
    const [paymentMethod, setPaymentMethod] = useState("COD");

    const shippingAmount = 100;
    const subTotal = products.reduce((amount, item) => amount + item.quantity * item.product[0].productPrice, 0);
    const totalAmount = subTotal + shippingAmount;

    const handleOrder = (data) => {
        const orderDetails = {
            shippingAddress: data.billingAddress,
            totalAmount,
            items: products.map(item => ({
                ...item,
                product: item.product[0]._id,
            })),
            paymentDetails: {
                method: paymentMethod,
            },
            phoneNumber: data.phoneNumber,
        };
        dispatch(createOrder(orderDetails));
    };

    const proceedForKhaltiPayment = () => {
        // const currentOrder = data[data.length -1]
        // if(status === STATUSES.SUCCESS && paymentMethod === "COD" ){
        //     return alert("Order placed successfully")
        //  }  
        if(status === STATUSES.SUCCESS && paymentMethod === "khalti" ){
            const {totalAmount,_id:orderId} = data[data.length -1].data
            console.log("nothing")
            console.log(data.data)
            console.log("first")
            console.log(totalAmount)
            console.log(orderId)
            console.log("second")
            return handleKhalti(orderId,totalAmount);
            
        //    return navigate(`/khalti?orderid=${_id}&totalamount=${totalAmount}`)
        }
    
    };

    useEffect(() => {
        proceedForKhaltiPayment();
    }, [status, data]);

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleKhalti = async (orderId, totalAmount) => {
        try {
            console.log(totalAmount)
            console.log("mrmao")
            console.log(orderId)
            const response = await APIForAuthenticated.post("/payment", { orderId, amount: totalAmount });
            console.log(response.data)
            if (response.status === 200) {
                window.location.href = response.data.paymentUrl;
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div className="grid sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32">
                <div className="px-4 pt-8">
                    <p className="text-xl font-medium">Order Summary</p>
                    <div className="mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6">
                        {products.map((product) => (
                            <div key={product.product[0]._id} className="flex flex-col rounded-lg bg-white sm:flex-row">
                                <img className="m-2 h-24 w-28 rounded-md border object-cover object-center" src={product.product[0].productImage} alt={product.product[0].productName} />
                                <div className="flex w-full flex-col px-4 py-4">
                                    <span className="font-semibold">{product.product[0].productName}</span>
                                    <span className="float-right text-gray-400">Qty: {product.quantity}</span>
                                    <p className="text-lg font-bold">Rs. {product.product[0].productPrice}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-8 text-lg font-medium">Payment Methods</p>
                    <form className="mt-5 grid gap-6">
                        <div className="relative">
                            <input className="peer hidden" id="radio_1" type="radio" value="COD" name="paymentMethod" checked={paymentMethod === "COD"} onChange={handlePaymentChange} />
                            <label className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4" htmlFor="radio_1">
                                <span className="mt-2 font-semibold">COD (Cash On Delivery)</span>
                            </label>
                        </div>
                        <div className="relative">
                            <input className="peer hidden" id="radio_2" type="radio" value="khalti" name="paymentMethod" onChange={handlePaymentChange} />
                            <label className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4" htmlFor="radio_2">
                                <span className="mt-2 font-semibold">Online (Khalti)</span>
                            </label>
                        </div>
                    </form>
                </div>
                <form onSubmit={handleSubmit(handleOrder)} noValidate>
                    <div className="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0">
                        <p className="text-xl font-medium">Payment Details</p>
                        <label className="mt-4 mb-2 block text-sm font-medium">Email</label>
                        <input type="email" {...register("email", { required: "Email must be specified" })} className="w-full rounded-md border px-4 py-3 text-sm shadow-sm outline-none focus:border-blue-500" placeholder="your.email@gmail.com" />
                        <p className="text-red-500 text-sm">{formState.errors.email && formState.errors.email.message}</p>
                        <label className="mt-4 mb-2 block text-sm font-medium">Shipping Address</label>
                        <input type="text" {...register("billingAddress", { required: "Billing address must be specified" })} className="w-full rounded-md border px-4 py-3 text-sm shadow-sm outline-none focus:border-blue-500" placeholder="Street Address" />
                        <p className="text-red-500 text-sm">{formState.errors.billingAddress && formState.errors.billingAddress.message}</p>
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">Total</p>
                            <p className="text-2xl font-semibold text-gray-900">Rs {totalAmount}</p>
                        </div>
                        {
                        paymentMethod==="COD"?
                        (<button 
                            onClick={() => {
                              alert("COD order has been placed");
                              window.location.href = "/";
                            }} 
                            type="button" 
                            className="mt-4 mb-8 w-full rounded-md bg-gray-900 px-6 py-3 font-medium text-white"
                          >
                            Place Order
                          </button>):
                        <button type="submit" className="mt-4 mb-8 w-full rounded-md bg-gray-900 px-6 py-3 font-medium text-white" style={{backgroundColor:'rebeccapurple'}}>
                            Pay Rs.{totalAmount} with Khalti
                        </button>
                    }
                    </div>
                </form>
            </div>
        </>
    );
};

export default CheckOut;
