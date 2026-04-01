import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { placeService } from '../services/placeService';
import { trendService } from '../services/trendService';
import { useAsync } from '../hooks/useAsync';

const DISTRICTS = ['강남', '홍대', '성수', '잠실', '이태원', '마포', '노량진', '신촌', '연남', '동탄'];

const DISTRICT_COORDS: Record<string, { mapX: number; mapY: number; lat: number; lng: number }> = {
  강남: { mapX: 64, mapY: 61, lat: 37.5172, lng: 127.0473 },
  홍대: { mapX: 28, mapY: 38, lat: 37.5571, lng: 126.9245 },
  성수: { mapX: 64, mapY: 44, lat: 37.5443, lng: 127.0557 },
  잠실: { mapX: 74, mapY: 59, lat: 37.5133, lng: 127.1000 },
  이태원: { mapX: 50, mapY: 58, lat: 37.5345, lng: 126.9940 },
  마포: { mapX: 33, mapY: 43, lat: 37.5490, lng: 126.9510 },
  노량진: { mapX: 39, mapY: 68, lat: 37.5130, lng: 126.9424 },
  신촌: { mapX: 30, mapY: 31, lat: 37.5595, lng: 126.9375 },
  연남: { mapX: 32, mapY: 28, lat: 37.5630, lng: 126.9230 },
  동탄: { mapX: 64, mapY: 84, lat: 37.2000, lng: 127.0728 },
};

export default function PlaceRegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preTrendId = searchParams.get('trendId') ?? '';

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('강남');
  const [trendId, setTrendId] = useState(preTrendId);
  const [availability, setAvailability] = useState<'available' | 'unknown'>('unknown');
  const [businessHours, setBusinessHours] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: trends } = useAsync(() => trendService.getTopTrends(), []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = '상호명을 입력하세요';
    if (!address.trim()) e.address = '주소를 입력하세요';
    if (!trendId) e.trendId = '연결할 트렌드를 선택하세요';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const coords = DISTRICT_COORDS[district] ?? DISTRICT_COORDS['강남'];
      const place = await placeService.createPlace({
        trendId,
        name: name.trim(),
        address: address.trim(),
        district,
        latitude: coords.lat,
        longitude: coords.lng,
        mapX: coords.mapX + (Math.random() - 0.5) * 4,
        mapY: coords.mapY + (Math.random() - 0.5) * 4,
        availabilityStatus: availability,
        stockLevel: availability === 'available' ? 'plenty' : 'out',
        businessHours: businessHours.trim() || '미확인',
        tags: [],
        notes: notes.trim(),
      });
      navigate(`/maps/${trendId}?newPlace=${place.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%', fontSize: 14, padding: '11px 12px',
    border: `1px solid ${hasError ? 'var(--color-pin-out)' : 'var(--color-border)'}`,
    borderRadius: 2, background: 'var(--color-bg)', color: 'var(--color-text)',
  });

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
        {label}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: 'var(--color-pin-out)', marginTop: 4 }}>{error}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 24px 48px' }}>
      <button onClick={() => navigate(-1)} style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 700, marginBottom: 20 }}>
        ← 돌아가기
      </button>
      <h1 style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', marginBottom: 28 }}>장소 등록</h1>

      <Field label="상호명 *" error={errors.name}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="매장 이름" style={inputStyle(!!errors.name)} />
      </Field>

      <Field label="주소 *" error={errors.address}>
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="서울 강남구 ..." style={inputStyle(!!errors.address)} />
      </Field>

      <Field label="지역구" error={undefined}>
        <select value={district} onChange={e => setDistrict(e.target.value)} style={{ ...inputStyle(false), width: 'auto', minWidth: 120 }}>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>

      <Field label="연결 트렌드 *" error={errors.trendId}>
        <select value={trendId} onChange={e => setTrendId(e.target.value)} style={inputStyle(!!errors.trendId)}>
          <option value="">트렌드 선택...</option>
          {(trends ?? []).map(t => <option key={t.id} value={t.id}>{t.keyword}</option>)}
        </select>
      </Field>

      <Field label="현재 판매 여부" error={undefined}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { val: 'available' as const, label: '판매중' },
            { val: 'unknown' as const, label: '미확인' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => setAvailability(opt.val)}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 700,
                border: availability === opt.val ? 'none' : '1px solid var(--color-border)',
                borderRadius: 999, cursor: 'pointer',
                background: availability === opt.val ? 'var(--color-text)' : 'var(--color-bg)',
                color: availability === opt.val ? 'var(--color-bg)' : 'var(--color-text-2)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="운영 시간" error={undefined}>
        <input value={businessHours} onChange={e => setBusinessHours(e.target.value)} placeholder="09:00-21:00" style={inputStyle(false)} />
      </Field>

      <Field label="메모" error={undefined}>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="추가 정보 (선택사항)" rows={3}
          style={{ ...inputStyle(false), resize: 'vertical' }} />
      </Field>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: '12px 32px', fontSize: 14, fontWeight: 700,
            background: 'var(--color-text)', color: 'var(--color-bg)',
            borderRadius: 2, cursor: 'pointer', opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? '등록 중...' : '장소 등록'}
        </button>
        <button onClick={() => navigate(-1)} style={{
          padding: '12px 24px', fontSize: 14, fontWeight: 700,
          border: '1px solid var(--color-border)', borderRadius: 2,
          cursor: 'pointer', color: 'var(--color-text-2)',
        }}>취소</button>
      </div>
    </div>
  );
}
