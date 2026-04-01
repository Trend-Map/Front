import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useMockStore } from '../hooks/useMockStore';
import { placeService } from '../services/placeService';
import { trendService } from '../services/trendService';
import PlaceStatusPanel from '../components/PlaceStatusPanel';
import UpdateFeed from '../components/UpdateFeed';

export default function PlaceDetailPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  useMockStore();
  const [refresh, setRefresh] = useState(0);

  const { data: place, loading: pLoading, refetch } = useAsync(
    () => placeId ? placeService.getPlaceById(placeId) : Promise.resolve(null),
    [placeId, refresh]
  );
  const { data: updates, loading: uLoading, refetch: refetchUpdates } = useAsync(
    () => placeId ? placeService.getUpdatesForPlace(placeId) : Promise.resolve([]),
    [placeId, refresh]
  );
  const { data: trend } = useAsync(
    () => place?.trendId ? trendService.getTrendById(place.trendId) : Promise.resolve(null),
    [place?.trendId]
  );

  const handleReport = useCallback(async (payload: Parameters<typeof placeService.reportPlaceStatus>[0]) => {
    await placeService.reportPlaceStatus(payload);
    await refetch();
    await refetchUpdates();
    setRefresh(r => r + 1);
  }, [refetch, refetchUpdates]);

  if (pLoading) {
    return (
      <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 28, width: '50%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 180 }} />
      </div>
    );
  }

  if (!place) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>장소를 찾을 수 없습니다</h2>
        <button onClick={() => navigate('/')} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>홈으로 →</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Back */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 700 }}>
          ← 돌아가기
        </button>
        {trend && (
          <button onClick={() => navigate(`/maps/${trend.id}`)} style={{ fontSize: 12, color: 'var(--color-accent)', fontWeight: 700 }}>
            ↑ {trend.keyword}
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(20px, 4vw, 28px)', letterSpacing: '-0.02em' }}>
            {place.name}
          </h1>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px',
              background: 'var(--color-surface)', borderRadius: 999, color: 'var(--color-text-2)',
            }}>
              {place.district}
            </span>
            {place.claimed && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', background: 'var(--color-accent-dim)', borderRadius: 999, color: 'var(--color-accent)' }}>
                ✓ 점주 인증
              </span>
            )}
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 4 }}>{place.address}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
          영업 시간: <strong>{place.businessHours}</strong>
        </div>
        {place.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {place.tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--color-surface)', borderRadius: 999, color: 'var(--color-text-3)', fontWeight: 700 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status panel */}
      <div style={{ marginBottom: 24 }}>
        <PlaceStatusPanel place={place} onReport={handleReport} />
      </div>

      {/* Claim button */}
      {!place.claimed && place.claimStatus === 'none' && (
        <div style={{ marginBottom: 24, padding: 16, border: '1px solid var(--color-border)', borderRadius: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>이 매장의 점주이신가요?</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 12 }}>
            점주 등록 시 재고·영업 정보를 직접 관리할 수 있습니다
          </div>
          <button
            onClick={() => navigate(`/owner/claim?placeId=${place.id}`)}
            style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 700,
              border: '1px solid var(--color-text)', borderRadius: 2, cursor: 'pointer',
              background: 'var(--color-bg)', color: 'var(--color-text)',
            }}
          >
            점주 등록하기
          </button>
        </div>
      )}

      {place.claimStatus === 'pending' && (
        <div style={{ marginBottom: 24, padding: 16, background: 'var(--color-accent-dim)', borderRadius: 2, border: '1px solid oklch(88% 0.06 28)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>점주 등록 검토 중</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 4 }}>신청이 완료되었습니다. 검토 후 결과를 안내드립니다.</div>
        </div>
      )}

      {/* Update history */}
      <section>
        <h2 style={{ fontWeight: 900, fontSize: 14, marginBottom: 0, padding: '0 0 12px', borderBottom: '2px solid var(--color-text)' }}>
          상태 변경 이력
        </h2>
        {uLoading ? (
          <div className="skeleton" style={{ height: 150, marginTop: 12 }} />
        ) : (
          <UpdateFeed updates={updates ?? []} />
        )}
        {!uLoading && (updates ?? []).length === 0 && (
          <div style={{ padding: '20px 0', fontSize: 13, color: 'var(--color-text-3)' }}>아직 이력이 없습니다</div>
        )}
      </section>
    </div>
  );
}
