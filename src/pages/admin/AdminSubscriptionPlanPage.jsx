// src/pages/admin/AdminSubscriptionPlanPage.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  adminListSubscriptionPlans,
  adminCreateSubscriptionPlan,
  adminUpdateSubscriptionPlan,
  adminDeleteSubscriptionPlan,
} from "../../api/subscriptionAdminApi";
import { useAuth } from "../../contexts/AuthContext";

function toInt(v) {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replaceAll(",", "").trim());
  if (Number.isNaN(n)) return null;
  return Math.trunc(n);
}

export default function AdminSubscriptionPlanPage() {
  const { isAdmin } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // 폼 상태(생성)
  const [cName, setCName] = useState("");
  const [cPrice, setCPrice] = useState("");
  const [cDays, setCDays] = useState("");
  const [cActive, setCActive] = useState(true);

  // 폼 상태(수정)
  const [editTarget, setEditTarget] = useState(null);
  const [eName, setEName] = useState("");
  const [ePrice, setEPrice] = useState("");
  const [eDays, setEDays] = useState("");
  const [eActive, setEActive] = useState(true);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => (b.planId ?? 0) - (a.planId ?? 0));
  }, [plans]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await adminListSubscriptionPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("플랜 목록을 불러오지 못했습니다. (관리자 권한/토큰 확인)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const resetCreateForm = () => {
    setCName("");
    setCPrice("");
    setCDays("");
    setCActive(true);
  };

  const openEditModal = (p) => {
    setEditTarget(p);
    setEName(p?.name ?? "");
    setEPrice(String(p?.price ?? ""));
    setEDays(String(p?.durationDays ?? ""));
    setEActive(Boolean(p?.isActive));
    setOpenEdit(true);
  };

  const handleCreate = async () => {
    const price = toInt(cPrice);
    const days = toInt(cDays);

    if (!cName.trim()) return alert("상품명을 입력해 주세요.");
    if (price === null || price < 0) return alert("가격을 0 이상 숫자로 입력해 주세요.");
    if (days === null || days < 1) return alert("기간(days)을 1 이상 숫자로 입력해 주세요.");

    try {
      await adminCreateSubscriptionPlan({
        name: cName.trim(),
        price,
        durationDays: days,
        isActive: cActive,
      });
      alert("플랜이 등록되었습니다.");
      setOpenCreate(false);
      resetCreateForm();
      fetchPlans();
    } catch (e) {
      console.error(e);
      alert("플랜 등록 실패");
    }
  };

  const handleUpdate = async () => {
    if (!editTarget?.planId) return;

    const price = toInt(ePrice);
    const days = toInt(eDays);

    // 부분 수정 가능하지만, UI는 기본값 채워둔 상태라 검증만 가볍게
    if (!eName.trim()) return alert("상품명을 입력해 주세요.");
    if (price === null || price < 0) return alert("가격을 0 이상 숫자로 입력해 주세요.");
    if (days === null || days < 1) return alert("기간(days)을 1 이상 숫자로 입력해 주세요.");

    try {
      await adminUpdateSubscriptionPlan(editTarget.planId, {
        name: eName.trim(),
        price,
        durationDays: days,
        isActive: eActive,
      });
      alert("플랜이 수정되었습니다.");
      setOpenEdit(false);
      setEditTarget(null);
      fetchPlans();
    } catch (e) {
      console.error(e);
      alert("플랜 수정 실패");
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await adminDeleteSubscriptionPlan(planId);
      alert("삭제되었습니다.");
      fetchPlans();
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  };

  const handleToggleActive = async (p) => {
    try {
      await adminUpdateSubscriptionPlan(p.planId, {
        isActive: !p.isActive,
      });
      fetchPlans();
    } catch (e) {
      console.error(e);
      alert("활성/비활성 변경 실패");
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h2>관리자 전용 페이지</h2>
        <p>접근 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>구독 상품(플랜) 관리</h1>
        <button onClick={() => setOpenCreate(true)} style={{ padding: "10px 14px", fontWeight: 800 }}>
          + 플랜 추가
        </button>
        <button onClick={fetchPlans} disabled={loading} style={{ marginLeft: "auto" }}>
          {loading ? "새로고침..." : "새로고침"}
        </button>
      </div>

      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 140px 120px 120px 220px", gap: 0, background: "#f8f9fa", padding: 12, fontWeight: 800 }}>
          <div>ID</div>
          <div>상품명</div>
          <div>가격</div>
          <div>기간(일)</div>
          <div>상태</div>
          <div style={{ textAlign: "right" }}>액션</div>
        </div>

        {sortedPlans.length === 0 && !loading && (
          <div style={{ padding: 16, opacity: 0.8 }}>등록된 플랜이 없습니다.</div>
        )}

        {sortedPlans.map((p) => (
          <div
            key={p.planId}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 140px 120px 120px 220px",
              padding: 12,
              borderTop: "1px solid #eee",
              alignItems: "center",
            }}
          >
            <div>#{p.planId}</div>
            <div style={{ fontWeight: 800 }}>{p.name}</div>
            <div>{Number(p.price ?? 0).toLocaleString()}원</div>
            <div>{p.durationDays}일</div>
            <div>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  background: p.isActive ? "#e7f5ff" : "#fff4e6",
                }}
              >
                {p.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => handleToggleActive(p)}>
                {p.isActive ? "비활성화" : "활성화"}
              </button>
              <button onClick={() => openEditModal(p)}>수정</button>
              <button onClick={() => handleDelete(p.planId)} style={{ color: "crimson" }}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== 생성 모달 ===================== */}
      {openCreate && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>플랜 추가</h2>

            <div style={styles.formRow}>
              <label style={styles.label}>상품명</label>
              <input value={cName} onChange={(e) => setCName(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>가격(원)</label>
              <input value={cPrice} onChange={(e) => setCPrice(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>기간(일)</label>
              <input value={cDays} onChange={(e) => setCDays(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>활성</label>
              <input type="checkbox" checked={cActive} onChange={(e) => setCActive(e.target.checked)} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button onClick={() => { setOpenCreate(false); resetCreateForm(); }}>취소</button>
              <button onClick={handleCreate} style={{ fontWeight: 800 }}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 수정 모달 ===================== */}
      {openEdit && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>플랜 수정 #{editTarget?.planId}</h2>

            <div style={styles.formRow}>
              <label style={styles.label}>상품명</label>
              <input value={eName} onChange={(e) => setEName(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>가격(원)</label>
              <input value={ePrice} onChange={(e) => setEPrice(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>기간(일)</label>
              <input value={eDays} onChange={(e) => setEDays(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>활성</label>
              <input type="checkbox" checked={eActive} onChange={(e) => setEActive(e.target.checked)} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button onClick={() => { setOpenEdit(false); setEditTarget(null); }}>취소</button>
              <button onClick={handleUpdate} style={{ fontWeight: 800 }}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    zIndex: 9999,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    background: "white",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  label: { fontWeight: 800, opacity: 0.85 },
  input: { padding: 10, border: "1px solid #ddd", borderRadius: 8 },
};
