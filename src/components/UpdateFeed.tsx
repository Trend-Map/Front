import type { PlaceStatusUpdate } from '../types';
import { timeAgo } from '../utils/time';

interface UpdateFeedProps {
  updates: PlaceStatusUpdate[];
  limit?: number;
}

const TYPE_COLOR: Record<PlaceStatusUpdate['type'], string> = {
  available: 'var(--color-pin-ok)',
  soldout: 'var(--color-pin-out)',
  restocked: 'var(--color-pin-ok)',
  low_stock: 'var(--color-amber)',
  closed_temporarily: 'var(--color-pin-unk)',
};

const TYPE_LABEL: Record<PlaceStatusUpdate['type'], string> = {
  available: '판매중',
  soldout: '품절',
  restocked: '재입고',
  low_stock: '재고부족',
  closed_temporarily: '임시휴업',
};

export default function UpdateFeed({ updates, limit }: UpdateFeedProps) {
  const items = limit ? updates.slice(0, limit) : updates;

  if (items.length === 0) {
    return (
      <div style={{ padding: '24px', color: 'var(--color-text-3)', fontSize: 13 }}>
        업데이트 내역이 없습니다
      </div>
    );
  }

  return (
    <div>
      {items.map((upd, i) => (
        <div key={upd.id} style={{
          display: 'flex', gap: 14, padding: '12px 20px',
          borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
        }}>
          {/* Timeline dot */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: TYPE_COLOR[upd.type], flexShrink: 0,
            }} />
            {i < items.length - 1 && (
              <div style={{ width: 1, flex: 1, background: 'var(--color-border)', marginTop: 4 }} />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, letterSpacing: '-0.01em' }}>
              {upd.placeName}
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 700,
                color: TYPE_COLOR[upd.type],
                background: upd.type === 'soldout' ? 'oklch(96% 0.04 25)' :
                  upd.type === 'available' || upd.type === 'restocked' ? 'oklch(96% 0.04 145)' : 'oklch(98% 0.02 75)',
                padding: '2px 6px', borderRadius: 999,
              }}>
                {TYPE_LABEL[upd.type]}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--color-text-3)' }}>
              <span>{upd.reportedBy}</span>
              <span>·</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{timeAgo(upd.reportedAt)}</span>
            </div>
            {upd.memo && (
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 4, fontWeight: 300 }}>
                "{upd.memo}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
