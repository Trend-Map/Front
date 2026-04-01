import { useAsync } from '../hooks/useAsync';
import { trendService } from '../services/trendService';
import TrendRankingList from '../components/TrendRankingList';

export default function TrendTopPage() {
  const { data: trends, loading } = useAsync(() => trendService.getTopTrends(), []);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '32px 24px 0' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>
          TREND RANKING
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '-0.03em', marginBottom: 8 }}>
          지금 트렌드 TOP 10
        </h1>
        <div style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 300, marginBottom: 24 }}>
          실시간 언급량 · 반응 점수 · 장소 연관도 기반 집계
        </div>
        <div style={{ borderBottom: '2px solid var(--color-text)' }} />
      </div>

      {loading ? (
        <div style={{ padding: 24 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, marginBottom: 1 }} />
          ))}
        </div>
      ) : (
        <TrendRankingList trends={trends ?? []} />
      )}
    </div>
  );
}
