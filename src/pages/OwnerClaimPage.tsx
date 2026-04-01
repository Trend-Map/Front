import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { placeService } from '../services/placeService';
import { ownerService } from '../services/ownerService';

export default function OwnerClaimPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get('placeId') ?? '';

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: place, loading } = useAsync(
    () => placeId ? placeService.getPlaceById(placeId) : Promise.resolve(null),
    [placeId]
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ownerName.trim()) e.ownerName = '점주 성함을 입력하세요';
    if (!phone.trim()) e.phone = '연락처를 입력하세요';
    if (!registrationNumber.trim()) e.registrationNumber = '사업자등록번호를 입력하세요';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !placeId) return;
    setSubmitting(true);
    try {
      await ownerService.claimPlace({
        placeId,
        businessName: place?.name ?? '',
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        registrationNumber: registrationNumber.trim(),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%', fontSize: 14, padding: '11px 12px',
    border: `1px solid ${hasError ? 'var(--color-pin-out)' : 'var(--color-border)'}`,
    borderRadius: 2, background: 'var(--color-bg)', color: 'var(--color-text)',
  });

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 12 }}>
          신청이 완료되었습니다
        </h2>
        <div style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.8, marginBottom: 8 }}>
          <strong>{place?.name}</strong>에 대한 점주 등록 신청이 접수되었습니다.
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>
          검토 완료까지 1-3 영업일이 소요됩니다.
        </div>
        <div style={{ padding: 16, background: 'var(--color-accent-dim)', borderRadius: 2, marginBottom: 32, textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', marginBottom: 8 }}>신청 현황</div>
          <div style={{ fontSize: 13 }}>
            <div style={{ marginBottom: 4 }}>매장명: <strong>{place?.name}</strong></div>
            <div style={{ marginBottom: 4 }}>점주명: <strong>{ownerName}</strong></div>
            <div>상태: <strong style={{ color: 'var(--color-amber)' }}>검토 대기 중</strong></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => placeId ? navigate(`/places/${placeId}`) : navigate('/')}
            style={{
              padding: '12px 24px', fontSize: 14, fontWeight: 700,
              background: 'var(--color-text)', color: 'var(--color-bg)',
              borderRadius: 2, cursor: 'pointer',
            }}
          >
            장소 상세 보기
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px', fontSize: 14, fontWeight: 700,
              border: '1px solid var(--color-border)', borderRadius: 2, cursor: 'pointer',
              color: 'var(--color-text-2)',
            }}
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 24px 48px' }}>
      <button onClick={() => navigate(-1)} style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 700, marginBottom: 20 }}>
        ← 돌아가기
      </button>

      <h1 style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', marginBottom: 8 }}>점주 등록</h1>
      <div style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 28 }}>
        매장 claim 후 재고·영업 정보를 직접 관리할 수 있습니다
      </div>

      {place && (
        <div style={{ padding: '14px 16px', background: 'var(--color-surface)', borderRadius: 2, marginBottom: 24, border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 700, marginBottom: 4 }}>등록 대상 매장</div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>{place.name}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{place.address}</div>
        </div>
      )}

      {!placeId && (
        <div style={{ padding: '14px 16px', background: 'oklch(96% 0.04 75)', borderRadius: 2, marginBottom: 24, fontSize: 13, color: 'var(--color-text-2)' }}>
          특정 장소 상세 페이지에서 점주 등록을 진행하세요
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
          점주 성함 *
        </label>
        <input value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="홍길동" style={inputStyle(!!errors.ownerName)} />
        {errors.ownerName && <div style={{ fontSize: 12, color: 'var(--color-pin-out)', marginTop: 4 }}>{errors.ownerName}</div>}
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
          연락처 *
        </label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" style={inputStyle(!!errors.phone)} />
        {errors.phone && <div style={{ fontSize: 12, color: 'var(--color-pin-out)', marginTop: 4 }}>{errors.phone}</div>}
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
          사업자등록번호 *
        </label>
        <input value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} placeholder="000-00-00000" style={inputStyle(!!errors.registrationNumber)} />
        {errors.registrationNumber && <div style={{ fontSize: 12, color: 'var(--color-pin-out)', marginTop: 4 }}>{errors.registrationNumber}</div>}
        <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 4 }}>실제 검증 없이 mock 처리됩니다</div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || !placeId}
          style={{
            padding: '12px 32px', fontSize: 14, fontWeight: 700,
            background: 'var(--color-text)', color: 'var(--color-bg)',
            borderRadius: 2, cursor: placeId ? 'pointer' : 'default',
            opacity: submitting || !placeId ? 0.5 : 1,
          }}
        >
          {submitting ? '신청 중...' : '점주 등록 신청'}
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
