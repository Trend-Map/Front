import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useMockStore } from '../hooks/useMockStore';
import { trendService } from '../services/trendService';
import { placeService } from '../services/placeService';
import RealMap from '../components/RealMap';
import type { Place, AvailabilityStatus } from '../types';
import { timeAgo } from '../utils/time';

const STATUS_COLOR: Record<Place['availabilityStatus'], string> = {
  available: '#16a34a',
  soldout: '#dc2626',
  low_stock: '#d97706',
  unknown: '#94a3b8',
};
const STATUS_LABEL: Record<Place['availabilityStatus'], string> = {
  available: '판매중',
  soldout: '품절',
  low_stock: '재고부족',
  unknown: '미확인',
};
const STATUS_BG: Record<Place['availabilityStatus'], string> = {
  available: 'oklch(96% 0.04 145)',
  soldout: 'oklch(96% 0.04 25)',
  low_stock: 'oklch(96% 0.06 60)',
  unknown: '#f1f5f9',
};

const FILTER_OPTIONS: { value: AvailabilityStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'available', label: '판매중' },
  { value: 'soldout', label: '품절' },
  { value: 'low_stock', label: '재고부족' },
];

const REPORT_TYPES: { type: Place['availabilityStatus']; label: string }[] = [
  { type: 'available', label: '판매중' },
  { type: 'soldout', label: '품절' },
  { type: 'low_stock', label: '재고부족' },
];

const PAGE_STYLE = `
  .td-page {
    display: flex;
    flex-direction: row;
    height: calc(100vh - var(--app-header-offset, 96px));
    overflow: hidden;
    background: #f8fafc;
  }

  .td-map {
    flex: 1;
    min-width: 0;
    height: 100%;
  }

  .td-panel {
    width: 360px;
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-left: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .td-panel__head {
    padding: 18px 20px 14px;
    border-bottom: 1px solid #e2e8f0;
  }

  .td-panel__title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .td-panel__rank {
    font-size: 11px;
    font-weight: 800;
    color: #2563eb;
    background: #eff6ff;
    padding: 2px 8px;
    border-radius: 999px;
    letter-spacing: 0.02em;
  }

  .td-panel__keyword {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #0f172a;
  }

  .td-panel__meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #64748b;
    font-variant-numeric: tabular-nums;
  }

  .td-panel__meta strong {
    color: #0f172a;
    font-weight: 700;
  }

  .td-panel__filters {
    display: flex;
    gap: 6px;
    padding: 10px 16px;
    border-bottom: 1px solid #e2e8f0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .td-panel__filters::-webkit-scrollbar { display: none; }

  .td-filter-btn {
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 999px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: all 0.1s;
  }

  .td-panel__list {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #e2e8f0 transparent;
  }

  .td-place-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: background 0.1s;
    background: transparent;
  }
  .td-place-row:hover { background: #f8fafc; }
  .td-place-row.is-selected { background: #eff6ff; }

  .td-place-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .td-place-info { flex: 1; min-width: 0; }

  .td-place-name {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .td-place-addr {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .td-place-row-foot {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .td-status-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 999px;
  }

  .td-place-time {
    font-size: 11px;
    color: #cbd5e1;
    font-variant-numeric: tabular-nums;
    margin-left: auto;
  }

  .td-panel__detail {
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .td-detail__inner {
    padding: 16px 20px;
  }

  .td-detail__name-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .td-detail__name {
    font-size: 15px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.02em;
    flex: 1;
  }

  .td-detail__link {
    font-size: 12px;
    color: #2563eb;
    font-weight: 700;
  }

  .td-detail__info-row {
    display: flex;
    gap: 16px;
    font-size: 12px;
    margin-bottom: 12px;
  }

  .td-detail__info-item { display: flex; flex-direction: column; gap: 2px; }
  .td-detail__info-label { color: #94a3b8; font-size: 10px; font-weight: 300; }
  .td-detail__info-value { font-weight: 700; color: #0f172a; }

  .td-report-btns {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
  }

  .td-report-btn {
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.1s;
  }

  .td-detail__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 16px;
    color: #94a3b8;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.1s;
  }
  .td-detail__close:hover { background: #e2e8f0; }

  .td-panel__add {
    padding: 12px 20px;
    border-top: 1px solid #e2e8f0;
  }

  .td-add-btn {
    width: 100%;
    padding: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    cursor: pointer;
    background: transparent;
    transition: all 0.1s;
  }
  .td-add-btn:hover { border-color: #94a3b8; color: #0f172a; background: #f8fafc; }

  /* Mobile */
  @media (max-width: 768px) {
    .td-page {
      flex-direction: column;
      height: calc(100vh - var(--app-bottom-offset, 104px));
    }
    .td-map { flex: 1; min-height: 0; }
    .td-panel {
      width: 100%;
      height: 300px;
      flex-shrink: 0;
      border-left: none;
      border-top: 1px solid #e2e8f0;
    }
    .td-panel__head { padding: 12px 16px 10px; }
    .td-panel__keyword { font-size: 16px; }
  }
`;

export default function TrendDetailPage() {
  const { trendId } = useParams<{ trendId: string }>();
  const navigate = useNavigate();
  useMockStore();

  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus | 'all'>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [reportType, setReportType] = useState<Place['availabilityStatus'] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const { data: trend, loading: tLoading } = useAsync(
    () => trendId ? trendService.getTrendById(trendId) : Promise.resolve(null),
    [trendId]
  );

  const loadPlaces = useCallback(async () => {
    if (!trendId) return;
    const places = await placeService.getPlacesByTrend(trendId);
    setAllPlaces(places);
  }, [trendId]);

  useEffect(() => { loadPlaces(); }, [loadPlaces]);

  const filteredPlaces = statusFilter === 'all'
    ? allPlaces
    : allPlaces.filter(p => p.availabilityStatus === statusFilter);

  const handlePlaceSelect = useCallback(async (id: string) => {
    setSelectedPlaceId(id);
    setReportType(null);
    setReportDone(false);
    if (id) {
      const place = await placeService.getPlaceById(id);
      setSelectedPlace(place);
    } else {
      setSelectedPlace(null);
    }
  }, []);

  const handleReport = async () => {
    if (!reportType || !selectedPlace) return;
    setSubmitting(true);
    const stockMap: Record<string, 'plenty' | 'low' | 'out'> = {
      available: 'plenty', soldout: 'out', low_stock: 'low', unknown: 'out',
    };
    try {
      await placeService.reportPlaceStatus({
        placeId: selectedPlace.id,
        type: reportType as Parameters<typeof placeService.reportPlaceStatus>[0]['type'],
        stockLevel: stockMap[reportType],
        memo: '',
        reportedBy: '익명',
      });
      await loadPlaces();
      const updated = await placeService.getPlaceById(selectedPlace.id);
      setSelectedPlace(updated);
      setReportType(null);
      setReportDone(true);
      setTimeout(() => setReportDone(false), 2500);
    } finally {
      setSubmitting(false);
    }
  };

  if (tLoading) return (
    <>
      <style>{PAGE_STYLE}</style>
      <div className="td-page">
        <div className="td-map" style={{ background: '#e2e8f0' }} />
        <div className="td-panel">
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 999 }} />
            <div className="skeleton" style={{ height: 24, width: '70%' }} />
            <div className="skeleton" style={{ height: 12, width: '50%' }} />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 64, margin: '0 20px 8px', borderRadius: 8 }} />
          ))}
        </div>
      </div>
    </>
  );

  if (!trend) return (
    <div style={{ padding: '64px 24px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: 12 }}>트렌드를 찾을 수 없습니다</h2>
      <button onClick={() => navigate('/ranking')} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
        트렌드 목록으로 →
      </button>
    </div>
  );

  return (
    <>
      <style>{PAGE_STYLE}</style>
      <div className="td-page">

        {/* ── Map ── */}
        <div className="td-map">
          <RealMap
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            onPlaceSelect={handlePlaceSelect}
          />
        </div>

        {/* ── Side panel ── */}
        <div className="td-panel">

          {/* Header */}
          <div className="td-panel__head">
            <div className="td-panel__title-row">
              <span className="td-panel__rank">#{trend.rank}</span>
              <span className="td-panel__keyword">{trend.keyword}</span>
            </div>
            <div className="td-panel__meta">
              <span><strong>{filteredPlaces.length}</strong>개 장소</span>
              <span><strong style={{ color: '#16a34a' }}>
                {allPlaces.filter(p => p.availabilityStatus === 'available').length}
              </strong> 판매중</span>
              <span><strong style={{ color: '#dc2626' }}>
                {allPlaces.filter(p => p.availabilityStatus === 'soldout').length}
              </strong> 품절</span>
            </div>
          </div>

          {/* Filters */}
          <div className="td-panel__filters">
            {FILTER_OPTIONS.map(opt => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  className="td-filter-btn"
                  onClick={() => setStatusFilter(opt.value)}
                  style={{
                    background: active ? '#0f172a' : '#f1f5f9',
                    color: active ? '#ffffff' : '#475569',
                    border: '1px solid transparent',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Place list */}
          <div className="td-panel__list">
            {filteredPlaces.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                조건에 맞는 장소가 없습니다
              </div>
            ) : (
              filteredPlaces.map(place => {
                const isSelected = place.id === selectedPlaceId;
                const color = STATUS_COLOR[place.availabilityStatus];
                return (
                  <div
                    key={place.id}
                    className={`td-place-row${isSelected ? ' is-selected' : ''}`}
                    onClick={() => handlePlaceSelect(isSelected ? '' : place.id)}
                  >
                    <div className="td-place-dot" style={{ background: color }} />
                    <div className="td-place-info">
                      <div className="td-place-name">{place.name}</div>
                      <div className="td-place-addr">{place.address}</div>
                      <div className="td-place-row-foot">
                        <span
                          className="td-status-badge"
                          style={{ color, background: STATUS_BG[place.availabilityStatus] }}
                        >
                          {STATUS_LABEL[place.availabilityStatus]}
                        </span>
                        {place.claimed && (
                          <span style={{ fontSize: 10, color: '#2563eb', fontWeight: 700 }}>✓ 점주인증</span>
                        )}
                        <span className="td-place-time">{timeAgo(place.lastUpdatedAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected place detail */}
          {selectedPlace && (
            <div className="td-panel__detail">
              <div className="td-detail__inner">
                <div className="td-detail__name-row">
                  <div className="td-place-dot" style={{ background: STATUS_COLOR[selectedPlace.availabilityStatus], marginTop: 0 }} />
                  <span className="td-detail__name">{selectedPlace.name}</span>
                  <button className="td-detail__link" onClick={() => navigate(`/places/${selectedPlace.id}`)}>
                    상세 →
                  </button>
                  <button className="td-detail__close" onClick={() => handlePlaceSelect('')}>×</button>
                </div>

                <div className="td-detail__info-row">
                  <div className="td-detail__info-item">
                    <span className="td-detail__info-label">현재 상태</span>
                    <span className="td-detail__info-value" style={{ color: STATUS_COLOR[selectedPlace.availabilityStatus] }}>
                      {STATUS_LABEL[selectedPlace.availabilityStatus]}
                    </span>
                  </div>
                  <div className="td-detail__info-item">
                    <span className="td-detail__info-label">영업시간</span>
                    <span className="td-detail__info-value">{selectedPlace.businessHours}</span>
                  </div>
                  <div className="td-detail__info-item">
                    <span className="td-detail__info-label">마지막 제보</span>
                    <span className="td-detail__info-value">{timeAgo(selectedPlace.lastUpdatedAt)}</span>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 300 }}>상태 제보</div>
                <div className="td-report-btns">
                  {REPORT_TYPES.map(rt => {
                    const active = reportType === rt.type;
                    return (
                      <button
                        key={rt.type}
                        className="td-report-btn"
                        onClick={() => setReportType(active ? null : rt.type)}
                        style={{
                          background: active ? '#0f172a' : '#f1f5f9',
                          color: active ? '#ffffff' : '#475569',
                          border: '1px solid transparent',
                        }}
                      >
                        {rt.label}
                      </button>
                    );
                  })}
                  {reportType && (
                    <button
                      className="td-report-btn"
                      onClick={handleReport}
                      disabled={submitting}
                      style={{
                        marginLeft: 'auto',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: '1px solid transparent',
                        opacity: submitting ? 0.6 : 1,
                      }}
                    >
                      {submitting ? '제출 중...' : '제출'}
                    </button>
                  )}
                </div>
                {reportDone && (
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>✓ 제보가 반영되었습니다</div>
                )}
              </div>
            </div>
          )}

          {/* Add place */}
          <div className="td-panel__add">
            <button className="td-add-btn" onClick={() => navigate(`/places/new?trendId=${trendId}`)}>
              + 장소 등록하기
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
