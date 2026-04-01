import type { Trend, Place, Post } from '../types';
import { timeAgo } from '../utils/time';

type ResultItem = Trend | Place | Post;

interface SearchResultGroupProps {
  title: string;
  items: ResultItem[];
  type: 'trend' | 'place' | 'post';
  onNavigate: (id: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  available: 'var(--color-pin-ok)',
  soldout: 'var(--color-pin-out)',
  low_stock: 'var(--color-amber)',
  unknown: 'var(--color-pin-unk)',
};

function isTrend(item: ResultItem): item is Trend { return 'rank' in item && 'score' in item; }
function isPlace(item: ResultItem): item is Place { return 'district' in item && 'mapX' in item; }

export default function SearchResultGroup({ title, items, type, onNavigate }: SearchResultGroupProps) {
  if (items.length === 0) return null;

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8, padding: '0 0 10px',
        borderBottom: '2px solid var(--color-text)', marginBottom: 0,
      }}>
        <h3 style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.01em' }}>{title}</h3>
        <span style={{ fontSize: 12, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>
          {items.length}건
        </span>
      </div>

      {items.map((item, i) => (
        <div
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            padding: '12px 0',
            borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
            cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.paddingLeft = '8px'; }}
          onMouseLeave={e => { e.currentTarget.style.paddingLeft = '0'; }}
          // Transition via style (not CSS class)
        >
          {type === 'trend' && isTrend(item) && (
            <>
              <span style={{
                fontWeight: 900, fontSize: 20, color: 'var(--color-surface)',
                minWidth: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
              }}>
                {item.rank}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.keyword}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                  {item.placeCount}개 장소 · {item.score.toLocaleString()}점
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--color-pin-ok)',
                background: 'oklch(96% 0.04 145)', padding: '2px 6px', borderRadius: 999,
              }}>
                ↑{item.growthRate}%
              </span>
            </>
          )}

          {type === 'place' && isPlace(item) && (
            <>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: STATUS_COLOR[item.availabilityStatus], flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                  {item.district} · {item.address}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: 'var(--color-text-2)',
                background: 'var(--color-surface)', padding: '2px 7px', borderRadius: 999,
              }}>
                {item.district}
              </span>
            </>
          )}

          {type === 'post' && !isTrend(item) && !isPlace(item) && (
            <>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{(item as Post).title}</div>
                <div style={{
                  fontSize: 12, color: 'var(--color-text-3)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {(item as Post).author} · {timeAgo((item as Post).createdAt)}
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>
                ♡ {(item as Post).likeCount}
              </span>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
