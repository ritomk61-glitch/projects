import React from 'react'
import First from './component/First'
import Contact from './Contact'
import About from './About'

const App = () => {
  return (
    <div>
      <First />

      <Routers>
        <Route path="/" element={<Home/>} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/About" element={<About />} />
      </Routers>
    </div>
  )
}

export default App
