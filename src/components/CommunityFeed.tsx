import type { Post } from '../types';
import { timeAgo } from '../utils/time';

interface CommunityFeedProps {
  posts: Post[];
  onPostClick: (id: string) => void;
}

export default function CommunityFeed({ posts, onPostClick }: CommunityFeedProps) {
  if (posts.length === 0) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--color-text-3)', fontSize: 14 }}>
        게시글이 없습니다
      </div>
    );
  }

  return (
    <div>
      {posts.map((post, i) => (
        <div
          key={post.id}
          onClick={() => onPostClick(post.id)}
          style={{
            padding: '18px 24px',
            borderBottom: i < posts.length - 1 ? '1px solid var(--color-border)' : 'none',
            cursor: 'pointer',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          {/* Title */}
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, letterSpacing: '-0.01em' }}>
            {post.title}
          </div>

          {/* Excerpt */}
          <div style={{
            fontSize: 13, color: 'var(--color-text-2)', fontWeight: 300,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', lineHeight: 1.6, marginBottom: 10,
          }}>
            {post.body}
          </div>

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
              {post.hashtags.slice(0, 4).map(tag => (
                <span key={tag} style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)',
                  background: 'var(--color-surface)', padding: '2px 8px', borderRadius: 999,
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-3)', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-text-2)' }}>{post.author}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{timeAgo(post.createdAt)}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, fontVariantNumeric: 'tabular-nums' }}>
              <span>♡ {post.likeCount}</span>
              <span>⊡ {post.saveCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
