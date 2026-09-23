// import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../../store/productSlice";
import { useNavigate } from "react-router-dom";

export default function Product() {
   
    //like a bomb carrying drone n vice city
    //that drops or takes bomb
    const dispatch = useDispatch()
    const navigate = useNavigate()
    //taking current state(already populated or empty array)
    //from productSlice and storing in products
    // destructuring the states from productSlice
    const {data,status} = useSelector(state => state.product)
    
    // assigning products variable with data fetched so we can use map and fetch data in UI
    //in folowing code products.map is used to fetch data from products 
    const products = data

    //in first reload of page invoke this effect hook
    useEffect(() => {
        //using product fetching function from productSlice does
        dispatch(fetchProducts())
    }, []);

    
    if(status=="loading"){
        return <div>Loading...</div>
    }
    if(status=="error"){
        return <div>An error occured...</div>
    }
    return (
        <div className="relative w-full">

            <div className="relative bg-white-50">
                <div className="container m-auto px-6 pt-32 md:px-12 lg:pt-[4.8rem] lg:px-7">
                    <h1 className="text-2xl font-bold text-yellow-900 md:text-3xl lg:w-10/12">Our Popular Foods</h1>

                    <div className="flex flex-wrap justify-between">
                        {/* statte based fetched products used here */}
                        {products.map((product) => (
                            <div onClick={()=>navigate(`/productDetails/${product._id}`)} key={product._id} className="mx-auto overflow-hidden duration-300 transform bg-white rounded-lg shadow-md mt-11 w-80 dark:bg-slate-800 hover:scale-105 hover:shadow-lg">
                                <img className="object-cover object-center w-full h-48" src={product.productImage} alt={product.productName} />
                                <div className="p-4">
                                    <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">{product.productName}</h2>
                                    <p className="mb-2 text-base text-gray-700 dark:text-gray-300">{product.productDescription}</p>
                                    <div className="flex items-center">
                                        <p className="mr-2 text-lg font-semibold text-gray-900 dark:text-white">Rs. {product.productPrice}</p>
                                        <p className="text-base font-medium text-gray-500 line-through dark:text-gray-300">{product.originalPrice}</p>
                                        
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </div>
    );
}