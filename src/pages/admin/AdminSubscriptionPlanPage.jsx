"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  adminListSubscriptionPlans,
  adminCreateSubscriptionPlan,
  adminUpdateSubscriptionPlan,
  adminDeleteSubscriptionPlan,
} from "../../api/subscriptionAdminApi";
import { useAuth } from "../../contexts/AuthContext";
import "./AdminSubscriptionPlanPage.css";

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
      alert("플랜 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchPlans();
  }, [isAdmin]);

  const resetCreateForm = () => {
    setCName(""); setCPrice(""); setCDays(""); setCActive(true);
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
    if (price === null || price < 0) return alert("가격을 입력해 주세요.");
    if (days === null || days < 1) return alert("기간을 입력해 주세요.");

    try {
      await adminCreateSubscriptionPlan({ name: cName.trim(), price, durationDays: days, isActive: cActive });
      alert("플랜이 등록되었습니다.");
      setOpenCreate(false);
      resetCreateForm();
      fetchPlans();
    } catch (e) { alert("플랜 등록 실패"); }
  };

  const handleUpdate = async () => {
    if (!editTarget?.planId) return;
    const price = toInt(ePrice);
    const days = toInt(eDays);
    if (!eName.trim()) return alert("상품명을 입력해 주세요.");
    if (price === null || price < 0) return alert("가격을 입력해 주세요.");

    try {
      await adminUpdateSubscriptionPlan(editTarget.planId, { name: eName.trim(), price, durationDays: days, isActive: eActive });
      alert("수정되었습니다.");
      setOpenEdit(false);
      setEditTarget(null);
      fetchPlans();
    } catch (e) { alert("수정 실패"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await adminDeleteSubscriptionPlan(id);
      fetchPlans();
    } catch (e) { alert("삭제 실패"); }
  };

  const handleToggleActive = async (p) => {
    try {
      await adminUpdateSubscriptionPlan(p.planId, { isActive: !p.isActive });
      fetchPlans();
    } catch (e) { alert("상태 변경 실패"); }
  };

  if (!isAdmin) return <div className="admin-sub-container"><h2>접근 권한이 없습니다.</h2></div>;

  return (
    <div className="admin-sub-container">
      <div className="admin-sub-header">
        <h1 className="admin-sub-title">구독 상품 관리</h1>
        <div className="header-action-btns">
          <button onClick={fetchPlans} className="btn-base btn-refresh" disabled={loading}>
            {loading ? "새로고침 중..." : "새로고침"}
          </button>
          <button onClick={() => setOpenCreate(true)} className="btn-base btn-add">
            + 플랜 추가
          </button>
        </div>
      </div>

      <div className="plan-table-wrapper">
        <div className="plan-table-header">
          <div>ID</div>
          <div>상품명</div>
          <div>가격</div>
          <div>기간(일)</div>
          <div>상태</div>
          <div style={{ textAlign: "right" }}>액션</div>
        </div>

        {sortedPlans.length === 0 && !loading && (
          <div style={{ padding: 40, textAlign: "center", color: "#868e96" }}>등록된 플랜이 없습니다.</div>
        )}

        {sortedPlans.map((p) => (
          <div key={p.planId} className="plan-item-row">
            <div style={{ color: "#adb5bd", fontSize: "13px" }}>#{p.planId}</div>
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div>{Number(p.price ?? 0).toLocaleString()}원</div>
            <div>{p.durationDays}일</div>
            <div>
              <span className={`status-badge ${p.isActive ? 'status-active' : 'status-inactive'}`}>
                {p.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div className="row-actions">
              <button onClick={() => handleToggleActive(p)} className="btn-small">
                {p.isActive ? "비활성" : "활성"}
              </button>
              <button onClick={() => openEditModal(p)} className="btn-small">수정</button>
              <button onClick={() => handleDelete(p.planId)} className="btn-small btn-delete">삭제</button>
            </div>
          </div>
        ))}
      </div>

      {/* 생성 모달 */}
      {openCreate && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>새 플랜 추가</h2>
            <div className="form-group">
              <label>상품명</label>
              <input className="form-input" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="예: 프리미엄 30일" />
            </div>
            <div className="form-group">
              <label>가격(원)</label>
              <input className="form-input" value={cPrice} onChange={(e) => setCPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>기간(일)</label>
              <input className="form-input" value={cDays} onChange={(e) => setCDays(e.target.value)} placeholder="30" />
            </div>
            <div className="form-group">
              <label className="checkbox-group">
                <input type="checkbox" checked={cActive} onChange={(e) => setCActive(e.target.checked)} />
                활성화 상태로 등록
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setOpenCreate(false); resetCreateForm(); }} className="btn-base btn-refresh">취소</button>
              <button onClick={handleCreate} className="btn-base btn-add">저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {openEdit && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>플랜 수정 #{editTarget?.planId}</h2>
            <div className="form-group">
              <label>상품명</label>
              <input className="form-input" value={eName} onChange={(e) => setEName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>가격(원)</label>
              <input className="form-input" value={ePrice} onChange={(e) => setEPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label>기간(일)</label>
              <input className="form-input" value={eDays} onChange={(e) => setEDays(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="checkbox-group">
                <input type="checkbox" checked={eActive} onChange={(e) => setEActive(e.target.checked)} />
                활성 상태 유지
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setOpenEdit(false); setEditTarget(null); }} className="btn-base btn-refresh">취소</button>
              <button onClick={handleUpdate} className="btn-base btn-add">수정완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}