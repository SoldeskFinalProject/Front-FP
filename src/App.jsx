import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/common/Navbar"
import SymptomPage from "./pages/SymptomPage"
import Dictionary from "./pages/Dictionary"
import Reserv from "./pages/Reserv"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="layout">
        <h1 className="text1">증상 분석 및 병원 추천 서비스</h1>
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<SymptomPage />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/reserv" element={<Reserv />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
