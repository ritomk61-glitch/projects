import axios from 'axios'
import React, { useState } from 'react'

const Practice = () => {

const [data, setdata] = useState([])

const calling =async () => {

const response =await axios.get('https://dummyjson.com/products?delay=1000')

console.log(response.data)
setdata(response.data.products)

}
  return (
    <div>
      <button onClick={calling}>click me</button>

      <div>
        {data.map(function(ele,idx){
      return (
         
         <img src={ele.images} alt="" />
)})}
      </div>
    </div>
  )
}

export default Practice