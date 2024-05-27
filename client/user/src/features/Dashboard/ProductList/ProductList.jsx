import React from "react";
import productListHome from "../../../mocks/ProductListHome/data";
import CoupleProducts from "./CoupleProducts";
import { getDashboardProducts } from "../../../services/products";

const ProductList = () => {
  const [products, setProducts] = React.useState([]);

  React.useEffect(() => {
    const getData = async () => {
      const data = await getDashboardProducts();
      
      if (data.status === "success") {
        setProducts(data.data.products);
      }
    };
    
    getData();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 gap-y-6 p-5 px-10">
      <div>
        <img
          className="rounded-xl"
          src="https://firebasestorage.googleapis.com/v0/b/foodorder-842d1.appspot.com/o/images%2Fhot.png?alt=media&token=d478baab-c6d5-4ad4-8226-f31ec7281325"
          alt=""
        />
      </div>
      {
        products && <>
          <CoupleProducts products={products.slice(0, 2)} />
          <CoupleProducts products={products.slice(2, 4)} />
          <CoupleProducts products={products.slice(4, 6)} />
        </>
      }
    </div>
  );
};

export default ProductList;
