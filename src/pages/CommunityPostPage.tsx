import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useMockStore } from '../hooks/useMockStore';
import { communityService } from '../services/communityService';
import { trendService } from '../services/trendService';
import { placeService } from '../services/placeService';
import { timeAgo, formatDate } from '../utils/time';

export default function CommunityPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  useMockStore();

  const [commentBody, setCommentBody] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localLike, setLocalLike] = useState(0);
  const [localSave, setLocalSave] = useState(0);

  const { data: post, loading: pLoading } = useAsync(
    () => postId ? communityService.getPostById(postId) : Promise.resolve(null),
    [postId]
  );
  const { data: comments, loading: cLoading, refetch: refetchComments } = useAsync(
    () => postId ? communityService.getCommentsByPost(postId) : Promise.resolve([]),
    [postId]
  );

  const linkedTrendsFetch = useCallback(async () => {
    if (!post) return [];
    return Promise.all(post.linkedTrendIds.map(id => trendService.getTrendById(id)));
  }, [post]);

  const linkedPlacesFetch = useCallback(async () => {
    if (!post) return [];
    return Promise.all(post.linkedPlaceIds.map(id => placeService.getPlaceById(id)));
  }, [post]);

  const { data: linkedTrends } = useAsync(linkedTrendsFetch, [post]);
  const { data: linkedPlaces } = useAsync(linkedPlacesFetch, [post]);

  const handleComment = async () => {
    if (!commentBody.trim() || !postId) return;
    setSubmitting(true);
    try {
      await communityService.createComment({ postId, body: commentBody, author: commentAuthor || '익명' });
      setCommentBody('');
      setCommentAuthor('');
      await refetchComments();
    } finally {
      setSubmitting(false);
    }
  };

  if (pLoading) {
    return (
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 36, marginBottom: 12, width: '70%' }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>게시글을 찾을 수 없습니다</h2>
        <button onClick={() => navigate('/community')} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
          커뮤니티로 →
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Back */}
      <div style={{ padding: '16px 24px 0' }}>
        <button onClick={() => navigate('/community')} style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 700 }}>
          ← 커뮤니티
        </button>
      </div>

      {/* Post */}
      <article style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
        {/* Title */}
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(20px, 4vw, 26px)', letterSpacing: '-0.02em', marginBottom: 12 }}>
          {post.title}
        </h1>

        {/* Author + date */}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-text-3)', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text-2)' }}>{post.author}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        {/* Linked trends + places */}
        {((linkedTrends?.filter(Boolean).length ?? 0) > 0 || (linkedPlaces?.filter(Boolean).length ?? 0) > 0) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {linkedTrends?.filter(Boolean).map(t => t && (
              <button key={t.id} onClick={() => navigate(`/maps/${t.id}`)} style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px',
                background: 'var(--color-accent-dim)', color: 'var(--color-accent)',
                borderRadius: 999, cursor: 'pointer',
              }}>
                ↑ {t.keyword}
              </button>
            ))}
            {linkedPlaces?.filter(Boolean).map(p => p && (
              <button key={p.id} onClick={() => navigate(`/places/${p.id}`)} style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px',
                background: 'var(--color-surface)', color: 'var(--color-text-2)',
                borderRadius: 999, cursor: 'pointer',
              }}>
                ◎ {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--color-text)', fontWeight: 400, whiteSpace: 'pre-wrap', marginBottom: 20 }}>
          {post.body}
        </div>

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {post.hashtags.map(tag => (
              <span key={tag} style={{
                fontSize: 12, fontWeight: 700, color: 'var(--color-text-3)',
                background: 'var(--color-surface)', padding: '3px 10px', borderRadius: 999,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          {[
            { type: 'like' as const, icon: '♡', label: '좋아요', count: post.likeCount + localLike, action: () => setLocalLike(l => l + 1) },
            { type: 'save' as const, icon: '⊡', label: '저장', count: post.saveCount + localSave, action: () => setLocalSave(l => l + 1) },
            { type: 'share' as const, icon: '↗', label: '공유', count: post.shareCount, action: () => {} },
          ].map(r => (
            <button
              key={r.type}
              onClick={r.action}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '8px 16px', fontSize: 13, fontWeight: 700,
                border: '1px solid var(--color-border)', borderRadius: 999,
                cursor: 'pointer', background: 'var(--color-bg)',
                color: 'var(--color-text-2)', fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span>{r.icon}</span>
              <span>{r.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </article>

      {/* Comments */}
      <section style={{ padding: '20px 24px' }}>
        <h2 style={{ fontWeight: 900, fontSize: 14, marginBottom: 16, letterSpacing: '-0.01em' }}>
          댓글 {cLoading ? '' : (comments?.length ?? 0)}
        </h2>

        {/* Comment list */}
        {comments?.map((c, i) => (
          <div key={c.id} style={{
            padding: '14px 0',
            borderBottom: i < (comments.length - 1) ? '1px solid var(--color-border)' : 'none',
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{c.author}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums' }}>
                {timeAgo(c.createdAt)}
              </span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text)' }}>{c.body}</div>
          </div>
        ))}

        {/* Comment form */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={commentAuthor}
              onChange={e => setCommentAuthor(e.target.value)}
              placeholder="닉네임 (선택)"
              style={{
                padding: '8px 12px', fontSize: 13, width: 140,
                border: '1px solid var(--color-border)', borderRadius: 2,
                background: 'var(--color-bg)',
              }}
            />
          </div>
          <textarea
            value={commentBody}
            onChange={e => setCommentBody(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={3}
            style={{
              width: '100%', fontSize: 14, padding: '12px',
              border: '1px solid var(--color-border)', borderRadius: 2,
              background: 'var(--color-bg)', resize: 'none', marginBottom: 8,
              color: 'var(--color-text)',
            }}
          />
          <button
            onClick={handleComment}
            disabled={submitting || !commentBody.trim()}
            style={{
              padding: '10px 24px', fontSize: 13, fontWeight: 700,
              background: commentBody.trim() ? 'var(--color-text)' : 'var(--color-border)',
              color: commentBody.trim() ? 'var(--color-bg)' : 'var(--color-text-3)',
              borderRadius: 2, cursor: commentBody.trim() ? 'pointer' : 'default',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </section>
    </div>
  );
}
