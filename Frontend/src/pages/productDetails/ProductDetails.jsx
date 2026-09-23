import { useParams } from "react-router-dom";
import ProductInfo from "./components/product/ProductInfo";
import Review from "./components/review/Review";

// import axios from "axios";

export default function ProductDetails() {
    const {id} = useParams();
    // console.log(id);
    return (<>
    <ProductInfo id={id} />
    <Review id={id} />
    </>
    );
}