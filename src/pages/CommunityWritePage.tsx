import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityService } from '../services/communityService';
import { trendService } from '../services/trendService';
import { placeService } from '../services/placeService';
import { useAsync } from '../hooks/useAsync';

export default function CommunityWritePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [selectedTrendIds, setSelectedTrendIds] = useState<string[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: trends } = useAsync(() => trendService.getTopTrends(), []);
  const { data: allPlaces } = useAsync(async () => {
    const t = await trendService.getTopTrends();
    const results = await Promise.all(t.slice(0, 5).map(tr => placeService.getPlacesByTrend(tr.id)));
    return results.flat();
  }, []);

  const hashtags = hashtagInput.split(',').map(h => h.trim()).filter(Boolean);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = '제목을 입력하세요';
    if (!body.trim()) e.body = '본문을 입력하세요';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const post = await communityService.createPost({
        title: title.trim(),
        body: body.trim(),
        hashtags,
        linkedTrendIds: selectedTrendIds,
        linkedPlaceIds: selectedPlaceIds,
        author: '익명',
      });
      navigate(`/community/posts/${post.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%', fontSize: 14, padding: '12px',
    border: `1px solid ${hasError ? 'var(--color-pin-out)' : 'var(--color-border)'}`,
    borderRadius: 2, background: 'var(--color-bg)',
    color: 'var(--color-text)',
  });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Back */}
      <button onClick={() => navigate('/community')} style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 700, marginBottom: 20 }}>
        ← 커뮤니티
      </button>

      <h1 style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', marginBottom: 28 }}>
        글쓰기
      </h1>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
          제목 *
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          style={inputStyle(!!errors.title)}
        />
        {errors.title && <div style={{ fontSize: 12, color: 'var(--color-pin-out)', marginTop: 4 }}>{errors.title}</div>}
      </div>

      {/* Body */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
          본문 *
        </label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="내용을 자유롭게 작성하세요"
          rows={8}
          style={{ ...inputStyle(!!errors.body), resize: 'vertical' }}
        />
        {errors.body && <div style={{ fontSize: 12, color: 'var(--color-pin-out)', marginTop: 4 }}>{errors.body}</div>}
      </div>

      {/* Hashtags */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
          해시태그 (쉼표로 구분)
        </label>
        <input
          value={hashtagInput}
          onChange={e => setHashtagInput(e.target.value)}
          placeholder="크로플, 동탄맛집, 디저트"
          style={inputStyle(false)}
        />
        {hashtags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {hashtags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)',
                background: 'var(--color-surface)', padding: '2px 8px', borderRadius: 999,
              }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Linked trends */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
          트렌드 연결 (선택)
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(trends ?? []).slice(0, 6).map(t => {
            const selected = selectedTrendIds.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrendIds(ids => selected ? ids.filter(id => id !== t.id) : [...ids, t.id])}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '5px 12px',
                  border: selected ? 'none' : '1px solid var(--color-border)',
                  borderRadius: 999, cursor: 'pointer',
                  background: selected ? 'var(--color-accent)' : 'var(--color-bg)',
                  color: selected ? 'var(--color-bg)' : 'var(--color-text-2)',
                }}
              >
                {t.keyword}
              </button>
            );
          })}
        </div>
      </div>

      {/* Linked places */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-2)' }}>
          장소 태그 (선택)
        </label>
        <select
          value={selectedPlaceIds[0] ?? ''}
          onChange={e => {
            const val = e.target.value;
            if (val && !selectedPlaceIds.includes(val)) setSelectedPlaceIds(ids => [...ids, val]);
          }}
          style={{ ...inputStyle(false), width: 'auto', minWidth: 200 }}
        >
          <option value="">장소 선택...</option>
          {(allPlaces ?? []).slice(0, 20).map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.district})</option>
          ))}
        </select>
        {selectedPlaceIds.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {selectedPlaceIds.map(id => {
              const place = allPlaces?.find(p => p.id === id);
              return place ? (
                <span key={id} style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  background: 'var(--color-surface)', borderRadius: 999,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {place.name}
                  <button onClick={() => setSelectedPlaceIds(ids => ids.filter(i => i !== id))}
                    style={{ fontWeight: 900, color: 'var(--color-text-3)', fontSize: 12 }}>×</button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: '12px 32px', fontSize: 14, fontWeight: 700,
            background: 'var(--color-text)', color: 'var(--color-bg)',
            borderRadius: 2, cursor: 'pointer', opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? '등록 중...' : '게시하기'}
        </button>
        <button
          onClick={() => navigate('/community')}
          style={{
            padding: '12px 24px', fontSize: 14, fontWeight: 700,
            border: '1px solid var(--color-border)', borderRadius: 2,
            cursor: 'pointer', color: 'var(--color-text-2)',
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
}
