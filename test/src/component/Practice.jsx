import React, { useState } from 'react'
import axios from 'axios'
const Practice = () => {

const [data, setdata] = useState([])

const calling =async () =>{

const response = await axios.get('https://dummyjson.com/recipes?delay=1000')
console.log(response.data)

setdata(response.data.recipes)
}
  return (
    <div>
      <button onClick={calling}>click me</button>


   <div>
    {data.map(function(ele,idx){
      return (
        <div id= {idx} className='flex gap-5'>
          <div></div>
        <img src={ele.image} className='h-90 w-100' />
        <h1 id={idx}>{ele.name}</h1>
        </div>
      )
    })}
    
   </div>      
    </div>
  )
}

export default Practice
