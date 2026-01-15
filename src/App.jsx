import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import ChatApp from './ChatApp'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ChatApp />} />
      </Routes>
    </BrowserRouter>
  )
}


