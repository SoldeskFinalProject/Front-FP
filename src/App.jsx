import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/common/Navbar";

// 일반 페이지
import SymptomPage from "./pages/SymptomPage";
import SymptomResultPage from "./pages/SymptomResultPage";
import Dictionary from "./pages/Dictionary";
import DrugDetail from "./pages/DrugDetail";
import Reserv from "./pages/Reserv";
import QnaPage from "./pages/QnaPage";
import QnaCreate from "./components/qna/QnaCreate";
import QnaDetail from "./components/qna/QnaDetail";
import DiseaseDictionary from "./pages/DiseaseDictionary";
import DiseaseDetail from "./pages/DiseaseDetail";

// 인증 및 소셜 로그인
import SignupPage from "./components/auth/SignupPage";
import LoginPage from "./components/auth/LoginPage";
import KakaoCallbackPage from "./pages/KakaoCallbackPage";
import NaverCallback from "./components/auth/NaverCallback";
import VerificationRequestPage from "./pages/VerificationRequestPage";
import DoctorVerificationForm from "./components/verification/DoctorVerificationForm";
import HospitalVerificationForm from "./components/verification/HospitalVerificationForm";
import FindAccount from "./components/auth/FindAccount";


// 마이페이지 관련
import MyPage from "./pages/MyPage";
import MyReservationPage from "./pages/MyReservationPage";
import MyReviewPage from "./pages/MyReviewPage";
import MyFavoritePage from "./pages/MyFavoritesPage";

// 병원 예약 및 리뷰
import HospitalReservationPage from "./pages/HospitalReservationPage";
import HospitalReviewPage from "./pages/HospitalReviewPage";

// 관리자(Admin) 페이지
import DiseaseAdminList from "./pages/admin/DiseaseAdminList";
import DiseaseAdminForm from "./pages/admin/DiseaseAdminForm";
import AdminVerificationPage from "./pages/admin/AdminVerificationPage";
import DoctorVerificationList from "./pages/admin/DoctorVerificationList";
import HospitalVerificationList from "./pages/admin/HospitalVerificationList";
import AdminSubscriptionPlanPage from "./pages/admin/AdminSubscriptionPlanPage";

// AI 채팅 위젯
import AiChatWidget from "./components/AiChatWidget/AiChatWidget";

// 병원 구독
import SubscriptionPurchasePage from "./pages/SubscriptionPurchasePage";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="layout">
          <h1 className="text1">증상 분석 및 병원 추천 서비스</h1>
          <Navbar />

          <main className="content">
            <Routes>
              {/* ✅ 시작 페이지를 증상검색으로 */}
              <Route path="/" element={<Navigate to="/search" replace />} />

              {/* 증상 분석 */}
              <Route path="/search" element={<SymptomPage />} />
              <Route path="/result" element={<SymptomResultPage />} />

              {/* 의약품 및 질병 사전 */}
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/dictionary/detail/:itemSeq" element={<DrugDetail />} />
              <Route path="/disease" element={<DiseaseDictionary />} />
              <Route path="/disease/:diseaseId" element={<DiseaseDetail />} />

              {/* 커뮤니티 및 예약 메인 */}
              <Route path="/reserv" element={<Reserv />} />
              <Route path="/qna" element={<QnaPage />} />
              <Route path="/qna/create" element={<QnaCreate />} />
              <Route path="/qna/:questionId" element={<QnaDetail />} />

              {/* 인증 관련 */}
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verification" element={<VerificationRequestPage />} />
              <Route path="/verification/doctor" element={<DoctorVerificationForm />} />
              <Route path="/verification/hospital" element={<HospitalVerificationForm />} />
              <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
              <Route path="/auth/naver/callback" element={<NaverCallback />} />
              <Route path="/find-account" element={<FindAccount />} />

              {/* 마이페이지 */}
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/mypage/reservations" element={<MyReservationPage />} />
              <Route path="/mypage/reviews" element={<MyReviewPage />} />
              <Route path="/mypage/favorites" element={<MyFavoritePage />} />

              {/* 병원 예약 및 리뷰 */}
              <Route
                path="/hospitals/:hospitalId/reservation"
                element={<HospitalReservationPage />}
              />
              <Route
                path="/reservations/:reservationId/review/new"
                element={<HospitalReviewPage />}
              />

              {/* 병원 구독 */}
              <Route path="/subscription" element={<SubscriptionPurchasePage />} />
              <Route path="/mypage/subscription" element={<SubscriptionPurchasePage />} />

              {/* 관리자(Admin) */}
              <Route path="/admin/diseases" element={<DiseaseAdminList />} />
              <Route path="/admin/diseases/form" element={<DiseaseAdminForm />} />
              <Route path="/admin/diseases/form/:id" element={<DiseaseAdminForm />} />
              <Route path="/admin/verification" element={<AdminVerificationPage />} />
              <Route path="/admin/verification/doctor" element={<DoctorVerificationList />} />
              <Route path="/admin/verification/hospital" element={<HospitalVerificationList />} />
              <Route path="/admin/subscriptions/plans" element={<AdminSubscriptionPlanPage />} />
            </Routes>
          </main>

          <AiChatWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
