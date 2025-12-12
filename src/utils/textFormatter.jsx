import React from 'react';

/**
 * 텍스트를 받아서 보기 좋은 JSX 배열로 변환하는 함수
 * @param {string} text - 원본 텍스트 (예: "1. 효능...\n2. 효과...")
 * @return {JSX.Element[]} - <p> 또는 <ul> 태그로 감싸진 요소들
 */
export const formatDrugText = (text) => {
  if (!text) return null;

  // 1. 불필요한 HTML 태그나 CDATA 제거 (혹시 백엔드에서 안 걸러졌을 경우 대비)
  let cleanText = text
    .replace(/<[^>]*>?/gm, '') // HTML 태그 제거
    .replace(/&nbsp;/g, ' ')   // 공백 특수문자 제거
    .replace(/\[CDATA\[/g, '') // CDATA 태그 제거
    .replace(/\]\]/g, '');

  // 2. 줄바꿈(\n)을 기준으로 텍스트 분리
  const lines = cleanText.split('\n').filter(line => line.trim() !== '');

  // 3. 각 줄을 분석해서 렌더링
  return (
    <div className="drug-text-content">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // (옵션) 번호로 시작하는 문장 (예: "1)", "1.", "-")은 강조하거나 리스트 처리
        const isListItem = /^[0-9]+[\.\)]|^\-/.test(trimmed);

        if (isListItem) {
            // 번호가 있는 줄은 들여쓰기 및 볼드 처리
            return <p key={index} className="drug-text-list-item">{trimmed}</p>;
        } else {
            // 일반 문장은 그냥 출력
            return <p key={index} className="drug-text-paragraph">{trimmed}</p>;
        }
      })}
    </div>
  );
};