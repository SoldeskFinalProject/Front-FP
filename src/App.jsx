import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/common/Navbar"
import SymptomPage from "./pages/SymptomPage"
import SymptomResultPage from "./pages/SymptomResultPage"
import Dictionary from "./pages/Dictionary"
import Reserv from "./pages/Reserv"
import DrugDetail from "./pages/DrugDetail"
import QnaPage from "./pages/QnaPage"
import QnaCreate from "./components/qna/QnaCreate"
import QnaDetail from "./components/qna/QnaDetail"
import DiseaseDictionary from "./pages/DiseaseDictionary";
import DiseaseDetail from "./pages/DiseaseDetail";
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
            <Route path="/result" element={<SymptomResultPage />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/reserv" element={<Reserv />} />
            <Route path="/dictionary/detail/:itemSeq" element={<DrugDetail />} />
            <Route path="/qna" element={<QnaPage />} />
            <Route path="/qna/create" element={<QnaCreate />} />
            <Route path="/qna/:questionId" element={<QnaDetail />} />
            <Route path="/disease" element={<DiseaseDictionary />} />
            <Route path="/disease/:diseaseId" element={<DiseaseDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
