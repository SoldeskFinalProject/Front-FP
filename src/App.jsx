import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Navbar from "./components/common/Navbar"
import HomePage from "./pages/HomePage"
import SymptomPage from "./pages/SymptomPage"
import SymptomResultPage from "./pages/SymptomResultPage"
import Dictionary from "./pages/Dictionary"
import Reserv from "./pages/Reserv"
import DrugDetail from "./pages/DrugDetail"
import QnaPage from "./pages/QnaPage"
import QnaCreate from "./components/qna/QnaCreate"
import QnaDetail from "./components/qna/QnaDetail"
import DiseaseDictionary from "./pages/DiseaseDictionary"
import DiseaseDetail from "./pages/DiseaseDetail"
import SignupPage from "./components/auth/SignupPage"
import LoginPage from "./components/auth/LoginPage"
import HospitalReservationPage from "./pages/HospitalReservationPage"
import HospitalReviewPage from "./pages/HospitalReviewPage"
import DiseaseAdminList from "./pages/admin/DiseaseAdminList"
import DiseaseAdminForm from "./pages/admin/DiseaseAdminForm"
import VerificationRequestPage from "./pages/VerificationRequestPage"
import AdminVerificationPage from "./pages/admin/AdminVerificationPage"
import KakaoCallbackPage from "./pages/KakaoCallbackPage";
import DoctorVerificationList from "./pages/admin/DoctorVerificationList"
import HospitalVerificationList from "./pages/admin/HospitalVerificationList"
import NaverCallback from "./components/auth/NaverCallback"

import "./App.css"
import ProtectedRoute from "./components/auth/ProtectedRoute"

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

              <Route path="/verification" element={<VerificationRequestPage />} />

              <Route path="/hospitals/:hospitalId/reservation" element={<HospitalReservationPage />} />
              <Route path="/hospitals/:hospitalId/review/new" element={<HospitalReviewPage />} />

              <Route path="/admin/diseases" element={<DiseaseAdminList />} />
              <Route path="/admin/diseases/form" element={<DiseaseAdminForm />} />
              <Route path="/admin/diseases/form/:id" element={<DiseaseAdminForm />} />
              <Route path="/admin/verification" element={<AdminVerificationPage />} />

              <Route path="/verification" element={<VerificationRequestPage />} />
              <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
              <Route path="/auth/naver/callback" element={<NaverCallback />} />

              <Route path="/admin/verification/doctor" element={<DoctorVerificationList />} />
              <Route path="/admin/verification/hospital" element={<HospitalVerificationList />} />

            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
