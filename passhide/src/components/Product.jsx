import React from 'react'

const Product = (props) => {


  return(
    <div className="parent">
        <div className="child">
            <div>
                <img src={props.image} alt="" />
            </div>
            <div>
                <p>{props.name}</p>
                <p>price:{props.price}</p>
                <p>{props.catagory}</p>
                <p className='k1'>{props.rating}</p>
                <p>{props.inStock}</p>
            </div>
        </div>
    </div>
  )
    }

export default Product
