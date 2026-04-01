import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useMockStore } from '../hooks/useMockStore';
import { communityService } from '../services/communityService';
import CommunityFeed from '../components/CommunityFeed';

export default function CommunityListPage() {
  useMockStore();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const { data: posts, loading } = useAsync(
    () => communityService.getPosts({ sortBy }),
    [sortBy]
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '28px 24px 0', borderBottom: '2px solid var(--color-text)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>
              COMMUNITY
            </div>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.03em' }}>
              자유 게시판
            </h1>
          </div>
          <button
            onClick={() => navigate('/community/write')}
            style={{
              padding: '10px 20px', fontSize: 13, fontWeight: 700,
              background: 'var(--color-accent)', color: 'var(--color-bg)',
              borderRadius: 2, cursor: 'pointer',
            }}
          >
            글쓰기
          </button>
        </div>

        {/* Sort tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {(['recent', 'popular'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 700,
                color: sortBy === s ? 'var(--color-text)' : 'var(--color-text-3)',
                borderBottom: sortBy === s ? '2px solid var(--color-text)' : '2px solid transparent',
                cursor: 'pointer', marginBottom: -2,
              }}
            >
              {s === 'recent' ? '최신순' : '인기순'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 24 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, marginBottom: 1 }} />
          ))}
        </div>
      ) : (
        <CommunityFeed
          posts={posts ?? []}
          onPostClick={id => navigate(`/community/posts/${id}`)}
        />
      )}

      {/* Mobile FAB */}
      <button
        className="mobile-only"
        onClick={() => navigate('/community/write')}
        style={{
          position: 'fixed', bottom: 96, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--color-accent)', color: 'var(--color-bg)',
          fontSize: 24, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }}
      >
        +
      </button>
    </div>
  );
}
