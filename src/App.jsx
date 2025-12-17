import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import SymptomPage from "./pages/SymptomPage";
import SymptomResultPage from "./pages/SymptomResultPage";
import Dictionary from "./pages/Dictionary";
import Reserv from "./pages/Reserv";
import DrugDetail from "./pages/DrugDetail";
import QnaPage from "./pages/QnaPage";
import QnaCreate from "./components/qna/QnaCreate";
import QnaDetail from "./components/qna/QnaDetail";
import DiseaseDictionary from "./pages/DiseaseDictionary";
import DiseaseDetail from "./pages/DiseaseDetail";
import SignupPage from "./components/auth/SignupPage";
import LoginPage from "./components/auth/LoginPage";
import PendingApprovalPage from "./components/auth/PendingApprovalPage";
import AdminApprovalPage from "./components/admin/AdminApprovalPage";

import "./App.css";

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
            <Route path="/dictionary/detail/:itemSeq" element={<DrugDetail />} />
            <Route path="/reserv" element={<Reserv />} />
            <Route path="/qna" element={<QnaPage />} />
            <Route path="/qna/create" element={<QnaCreate />} />
            <Route path="/qna/:questionId" element={<QnaDetail />} />

            {/* 질병 사전 관련 라우트 */}
            <Route path="/disease" element={<DiseaseDictionary />} />
            <Route path="/disease/:diseaseId" element={<DiseaseDetail />} />

            {/* 인증 및 관리자 관련 라우트 */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pending" element={<PendingApprovalPage />} />
            <Route path="/admin/approval" element={<AdminApprovalPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;