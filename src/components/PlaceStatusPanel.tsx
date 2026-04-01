import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Place, PlaceStatusUpdate } from '../types';
import { timeAgo } from '../utils/time';

interface PlaceStatusPanelProps {
  place: Place;
  onReport: (payload: {
    placeId: string;
    type: PlaceStatusUpdate['type'];
    stockLevel: PlaceStatusUpdate['stockLevel'];
    memo: string;
    reportedBy: string;
  }) => Promise<void>;
}

const STATUS_COLOR: Record<Place['availabilityStatus'], string> = {
  available: 'var(--color-pin-ok)',
  soldout: 'var(--color-pin-out)',
  low_stock: 'var(--color-amber)',
  unknown: 'var(--color-pin-unk)',
};

const STATUS_LABEL: Record<Place['availabilityStatus'], string> = {
  available: '판매중',
  soldout: '품절',
  low_stock: '재고부족',
  unknown: '미확인',
};

const REPORT_TYPES: { type: PlaceStatusUpdate['type']; label: string; stock: PlaceStatusUpdate['stockLevel'] }[] = [
  { type: 'available', label: '판매중', stock: 'plenty' },
  { type: 'soldout', label: '품절', stock: 'out' },
  { type: 'low_stock', label: '재고부족', stock: 'low' },
];

export default function PlaceStatusPanel({ place, onReport }: PlaceStatusPanelProps) {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<PlaceStatusUpdate['type'] | null>(null);
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reportType) return;
    setSubmitting(true);
    try {
      const stockMap: Record<PlaceStatusUpdate['type'], PlaceStatusUpdate['stockLevel']> = {
        available: 'plenty', soldout: 'out', restocked: 'plenty', low_stock: 'low', closed_temporarily: 'out',
      };
      await onReport({ placeId: place.id, type: reportType, stockLevel: stockMap[reportType], memo, reportedBy: '익명' });
      setDone(true);
      setReportType(null);
      setMemo('');
      setTimeout(() => setDone(false), 2500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
      borderRadius: 2, padding: 20,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%', marginTop: 3,
          background: STATUS_COLOR[place.availabilityStatus], flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', marginBottom: 2 }}>
            {place.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 300 }}>
            {place.address}
          </div>
        </div>
        <button
          onClick={() => navigate(`/places/${place.id}`)}
          style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700, padding: '4px 0' }}
        >
          상세 →
        </button>
      </div>

      {/* Status + meta */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16, fontSize: 13 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-3)', fontWeight: 300, marginBottom: 2 }}>현재 상태</div>
          <div style={{ fontWeight: 900, color: STATUS_COLOR[place.availabilityStatus] }}>
            {STATUS_LABEL[place.availabilityStatus]}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-3)', fontWeight: 300, marginBottom: 2 }}>영업 시간</div>
          <div style={{ fontWeight: 700 }}>{place.businessHours}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-3)', fontWeight: 300, marginBottom: 2 }}>마지막 제보</div>
          <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{timeAgo(place.lastUpdatedAt)}</div>
        </div>
        {place.claimed && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-text-3)', fontWeight: 300, marginBottom: 2 }}>점주</div>
            <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700 }}>✓ 인증됨</div>
          </div>
        )}
      </div>

      {/* Report buttons */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginBottom: 8, fontWeight: 300 }}>
          상태 제보
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {REPORT_TYPES.map(rt => (
            <button
              key={rt.type}
              onClick={() => setReportType(reportType === rt.type ? null : rt.type)}
              style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 700,
                border: reportType === rt.type ? '1px solid transparent' : '1px solid var(--color-border)',
                borderRadius: 999, cursor: 'pointer',
                background: reportType === rt.type ? 'var(--color-text)' : 'var(--color-bg)',
                color: reportType === rt.type ? 'var(--color-bg)' : 'var(--color-text-2)',
              }}
            >
              {rt.label}
            </button>
          ))}
        </div>

        {/* Inline form */}
        {reportType && (
          <div style={{ marginTop: 8 }}>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="메모 (선택사항)"
              rows={2}
              style={{
                width: '100%', fontSize: 13, padding: '8px 12px',
                border: '1px solid var(--color-border)', borderRadius: 2,
                background: 'var(--color-bg)', resize: 'none',
                color: 'var(--color-text)',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                marginTop: 6, padding: '8px 20px', fontSize: 13, fontWeight: 700,
                background: 'var(--color-accent)', color: 'var(--color-bg)',
                borderRadius: 2, cursor: 'pointer', opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? '제출 중...' : '제보 제출'}
            </button>
          </div>
        )}

        {done && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-pin-ok)', fontWeight: 700 }}>
            ✓ 제보가 반영되었습니다
          </div>
        )}
      </div>
    </div>
  );
}
