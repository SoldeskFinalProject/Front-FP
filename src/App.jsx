import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import "./App.css"
import LoginPage from "./components/auth/LoginPage"
import SignupPage from "./components/auth/SignupPage"
import Navbar from "./components/common/Navbar"
import QnaCreate from "./components/qna/QnaCreate"
import QnaDetail from "./components/qna/QnaDetail"
import { AuthProvider } from "./contexts/AuthContext"
import Dictionary from "./pages/Dictionary"
import DiseaseDetail from "./pages/DiseaseDetail"
import DiseaseDictionary from "./pages/DiseaseDictionary"
import DrugDetail from "./pages/DrugDetail"
import HomePage from "./pages/HomePage"
import HospitalReservationPage from "./pages/HospitalReservationPage"
import HospitalReviewPage from "./pages/HospitalReviewPage"
import QnaPage from "./pages/QnaPage"
import Reserv from "./pages/Reserv"
import SymptomPage from "./pages/SymptomPage"
import SymptomResultPage from "./pages/SymptomResultPage"
import VerificationRequestPage from "./pages/VerificationRequestPage"
import AdminVerificationPage from "./pages/admin/AdminVerificationPage"
import DiseaseAdminForm from "./pages/admin/DiseaseAdminForm"
import DiseaseAdminList from "./pages/admin/DiseaseAdminList"
import DoctorVerificationList from "./pages/admin/DoctorVerificationList"
import HospitalVerificationList from "./pages/admin/HospitalVerificationList"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="layout">
          <h1 className="text1">증상 분석 및 병원 추천 서비스</h1>
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SymptomPage />} />
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

              <Route path="/hospitals/:hospitalId/reservation" element={<HospitalReservationPage />} />
              <Route path="/hospitals/:hospitalId/review/new" element={<HospitalReviewPage />} />

              <Route path="/admin/diseases" element={<DiseaseAdminList />} />
              <Route path="/admin/diseases/form" element={<DiseaseAdminForm />} />
              <Route path="/admin/diseases/form/:id" element={<DiseaseAdminForm />} />
              <Route path="/admin/verification" element={<AdminVerificationPage />} />
              <Route path="/verification" element={<VerificationRequestPage />} />
              <Route path="admin/verification/doctor" element={<DoctorVerificationList />} />
              <Route path="admin/verification/hospital" element={<HospitalVerificationList />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
