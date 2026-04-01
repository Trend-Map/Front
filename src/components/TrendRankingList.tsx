import { useNavigate } from 'react-router-dom';
import type { Trend } from '../types';
import { timeAgo } from '../utils/time';

interface TrendRankingListProps {
  trends: Trend[];
  limit?: number;
}

export default function TrendRankingList({ trends, limit }: TrendRankingListProps) {
  const navigate = useNavigate();
  const items = limit ? trends.slice(0, limit) : trends;
  const maxScore = Math.max(...trends.map(t => t.score), 1);

  return (
    <div>
      {items.map((trend) => (
        <div
          key={trend.id}
          onClick={() => navigate(`/maps/${trend.id}`)}
          style={{
            position: 'relative', overflow: 'hidden',
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer',
            borderLeft: trend.rank === 1 ? '4px solid var(--color-accent)' : '4px solid transparent',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          {/* Ghost rank number */}
          <div style={{
            position: 'absolute', right: 16, top: '50%',
            transform: 'translateY(-50%)',
            fontWeight: 900,
            fontSize: 'clamp(60px, 10vw, 120px)',
            lineHeight: 1,
            color: 'var(--color-surface)',
            userSelect: 'none', pointerEvents: 'none',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {trend.rank}
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <span style={{
                fontWeight: 900, fontSize: 22,
                letterSpacing: '-0.02em', lineHeight: 1.1,
                color: 'var(--color-text)',
              }}>
                {trend.keyword}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: 'var(--color-pin-ok)',
                background: 'oklch(96% 0.04 145)',
                padding: '2px 6px', borderRadius: 999,
              }}>
                ↑{trend.growthRate}%
              </span>
              <span style={{
                fontSize: 11, color: 'var(--color-text-3)',
                background: 'var(--color-surface)',
                padding: '2px 6px', borderRadius: 999, fontWeight: 300,
              }}>
                {trend.category}
              </span>
            </div>

            {/* Score bar */}
            <div style={{
              width: '100%', maxWidth: 280, height: 3,
              background: 'var(--color-border)', borderRadius: 2, marginBottom: 8,
            }}>
              <div style={{
                width: `${(trend.score / maxScore) * 100}%`,
                height: '100%',
                background: trend.rank === 1 ? 'var(--color-accent)' : 'var(--color-text-2)',
                borderRadius: 2,
                transition: 'width 0.5s var(--ease-out)',
              }} />
            </div>

            {/* Meta */}
            <div style={{
              display: 'flex', gap: 16, fontSize: 12,
              color: 'var(--color-text-3)', fontWeight: 300,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-2)', fontVariantNumeric: 'tabular-nums' }}>
                {trend.score.toLocaleString()}점
              </span>
              <span>{trend.placeCount}개 장소</span>
              <span>{trend.postCount}개 글</span>
              <span>{timeAgo(trend.updatedAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
