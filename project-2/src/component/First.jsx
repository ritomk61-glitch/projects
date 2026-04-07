import React, { useEffect, useState } from "react";
import axios from "axios";

const First = () => {
  const [datas, setdatas] = useState([]);
  const handelclick = async () => {
    const data = await axios.get("https://fakestoreapi.com/products");

    setdatas(data.data);
    console.log(data.data);
  };

  const catagori = async () =>{
    const datas = await axios.get("https://dummyjson.com/products/categories")

    console.log(datas.data)
  }

  useEffect(() => {
    handelclick();
  }, []);
  return (

    
    <div className="bg-gray-100 min-h-screen ">
      <div className="bg-amber-700 w-full h-30 flex justify-between">
          <div>
          </div>
          <div className="flex gap-6 pt-7 justify-between  ">
            <div>
            <h1>Shophy</h1>
            </div>
            <Link to={"/"} >Home</Link>
            <Link to={"/Contact"} >Contact</Link>
            <Link to={"/About"} >About us</Link>
            
            <button className="bg-blue-950 h-10 text-white w-30 mr-8 rounded mb-0.5">log in</button>
        
            
          </div>
      </div>
      <div className="flex justify-center flex-col items-center ">
        <h5 className="text-cyan-600 font-bold tracking-widest">
          NEW COLLECTION
        </h5>

        <h1 className="text-black font-bold font-serif text-5xl pt-6 ">Shop</h1>
      </div>
      <div className="flex flex-wrap ml-20">
        {datas.map(function (elem) {
          return (
            <div key={elem.id} className="h-250 hover:scale-105 transition-transform duration-300">
              <div className="h-auto  w-96 m-20 p-4 rounded-xl shadow-lg ">
                <img className="h-90 w-96 " src={elem.image} alt="" />

                <h6 className=" text-blue-600 font-sans font-medium bg-blue-100 w-40 px-3 mt-4 tracking-widest flex justify-center rounded-2xl">
                  {elem.category}
                </h6>
                <h1 className="text-black font-bold text-xl pt-4">
                  {elem.title}
                </h1>
                <p>{elem.description}</p>
                <div className="flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) =>
                    star <= Math.round(elem.rating.rate) ? "★" : "☆",
                  )}
                </div>
                <div className="flex justify-between mt-5">
                  <h1 className="text-red-600 font-bold text-xl mt-4">${elem.price}</h1>
                  <button className="bg-black text-white px-4 py-2 rounded-lg text-2xl mt-2">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default First;
