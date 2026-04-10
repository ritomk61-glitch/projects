import React, { useState } from 'react'

const Fromm = () => {

const [name, setname] = useState('')
const [sysid, setsysid] = useState('')
const [pass, setpass] = useState('')

const [submit, setsubmit] = useState(null)
const [count, setcount] = useState(0)
const submitted = (e) =>{
  e.preventDefault()
  // console.log(name)
  // console.log(sysid)
  // console.log(pass)
  console.log(submit)
  setsubmit({
    name:name,
    sysid:sysid,
    pass:pass
    
  })

  
  setname('')
  setsysid('')
  setpass('')
}




return (
  <div className=''> 
  {/* <div className='flex justify-center items-center'> */}

  <form onSubmit={(e)=>{submitted(e)}} className='flex flex-col gap-3  w-110 justify-center ml-150 mt-60 items-center h-60 rounded-2xl  shadow-md'>
    <input type="text" placeholder='enter your name:'
    value={name} 
    onChange={(e) =>{
      setname(e.target.value)
    }}
    className='outline-1 rounded p-2'
    />

    <input type="number" placeholder='enter your system id'
    value={sysid}
    onChange={(e)=>{
      setsysid(e.target.value)
    }}className='outline-1 rounded p-2'
    />

    <input type="password" placeholder='enter your password' 
    value={pass}
    onChange={(e)=>{
      setpass(e.target.value)
    }}className='outline-1 rounded p-2 '
    />
    <button className='bg-blue-500 p-2 rounded-lg text-2xl text-white items-center ' onClick={()=>{setcount(count+1)}}>submittttt</button>

  </form>
    {/* </div> */}
 
    {
      submit && (
        <div className='flex justify-center text-2xl flex-col ml-180 mt-30 border-0 text-amber-950 font-extrabold'>
          <h1>student no:{count}</h1>
          <h1>your name:{submit.name}</h1>
          <h1>your system id:{submit.sysid}</h1>
          <h1>password:{submit.pass}</h1>
        </div>
      )
    }
     
      
    

  

    </div>
  )
}

export default Fromm

