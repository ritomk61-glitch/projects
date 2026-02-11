import React from 'react'
import { useState } from 'react'

const Passhide = () => {
    const [passshow,setshowpass]=useState(true);

    const changepass =()=>{
        setshowpass(!passshow);
    }
  return (
   <>
   <input type={passshow == true ? "text":"password"} />
   <button onClick={changepass}>{passshow == true ? "hide":"show"}</button>
   </>
  )
}

export default Passhide;
