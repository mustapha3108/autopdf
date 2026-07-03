import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Doc from './pages/Doc'
import Create from './pages/Create'
import Templates from './pages/Templates'
import Form from './pages/Form'
import Preview from './pages/Preview'
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Doc" element={<Doc />} />
        <Route path="/Create" element={<Create />} />
        <Route path="/Templates" element={<Templates />} />
        <Route path="/Form" element={<Form />} />
        <Route path="/Preview" element={<Preview />} />
      </Routes>
    </>
  )
}

export default App
