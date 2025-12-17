import React, { useEffect, useState } from "react";
import { fetchNearbyHospitals } from "../../api/hospitalApi";

function NearbyHospitalSection({ userLocation, symptomCode }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userLocation) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchNearbyHospitals({
          lat: userLocation.lat,
          lng: userLocation.lng,
          symptom: symptomCode,
          limit: 20,
        });

        setHospitals(data);
      } catch (e) {
        console.error(e);
        setError("병원 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userLocation, symptomCode]);

  if (!userLocation) {
    return <p>내 위치를 가져오는 중입니다…</p>;
  }

  if (loading) return <p>병원 추천 중…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (hospitals.length === 0) return <p>주변에 추천할 병원이 없습니다.</p>;

  return (
    <div>
      <h3>내 주변 추천 병원</h3>
      <ul>
        {hospitals.map((h) => (
          <li key={h.hospitalId} style={{ marginBottom: "12px" }}>
            <div style={{ fontWeight: "bold" }}>{h.name}</div>
            <div>{h.roadAddress || h.addr}</div>
            {h.distanceKm != null && (
              <div>{h.distanceKm.toFixed(1)} km 거리</div>
            )}
            {h.ratingAvg != null && (
              <div>
                평점 {h.ratingAvg} ({h.reviewCount ?? 0}명)
              </div>
            )}
            {h.tel && <div>전화: {h.tel}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NearbyHospitalSection;