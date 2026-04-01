import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchService } from '../services/searchService';
import type { SearchResults } from '../types';
import SearchResultGroup from '../components/SearchResultGroup';
import RelatedKeywords from '../components/RelatedKeywords';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [popularQueries, setPopularQueries] = useState<string[]>([]);

  useEffect(() => {
    searchService.getPopularQueries().then(setPopularQueries);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await searchService.searchAll({ query: q });
      setResults(res);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce on input
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setQuery(q);
    if (q) doSearch(q);
    else setResults(null);
  }, [searchParams, doSearch]);

  const handleInput = (val: string) => {
    setQuery(val);
    if (!val.trim()) { setResults(null); setSearchParams({}); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query });
    else setResults(null);
  };

  const totalCount = results ? results.trends.length + results.places.length + results.posts.length : 0;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Search input */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative' }}>
          <input
            value={query}
            onChange={e => handleInput(e.target.value)}
            placeholder="트렌드, 장소, 게시글 통합 검색"
            autoFocus
            style={{
              width: '100%', fontSize: 16, fontWeight: 400,
              padding: '14px 16px 14px 44px',
              border: '2px solid var(--color-text)', borderRadius: 2,
              background: 'var(--color-bg)', color: 'var(--color-text)',
            }}
          />
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, color: 'var(--color-text-3)',
          }}>⌕</span>
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults(null); setSearchParams({}); }}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 18, color: 'var(--color-text-3)', fontWeight: 700,
              }}
            >×</button>
          )}
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 2 }} />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && results && totalCount === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⌕</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>검색 결과가 없습니다</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-3)' }}>다른 키워드로 검색해 보세요</div>
        </div>
      )}

      {/* Results */}
      {!loading && results && totalCount > 0 && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 20, fontVariantNumeric: 'tabular-nums' }}>
            <strong style={{ color: 'var(--color-text)', fontWeight: 900 }}>{totalCount}</strong>건의 결과
          </div>

          <SearchResultGroup
            title="트렌드"
            items={results.trends}
            type="trend"
            onNavigate={id => navigate(`/maps/${id}`)}
          />
          <SearchResultGroup
            title="장소"
            items={results.places}
            type="place"
            onNavigate={id => navigate(`/places/${id}`)}
          />
          <SearchResultGroup
            title="커뮤니티 글"
            items={results.posts}
            type="post"
            onNavigate={id => navigate(`/community/posts/${id}`)}
          />

          {results.relatedKeywords.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <RelatedKeywords keywords={results.relatedKeywords} label="연관 키워드" />
            </div>
          )}
        </div>
      )}

      {/* Empty state — popular searches */}
      {!loading && !results && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-3)', letterSpacing: '0.06em', marginBottom: 12 }}>
            인기 검색어
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {popularQueries.map((q, i) => (
              <button
                key={q}
                onClick={() => { setQuery(q); setSearchParams({ q }); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '12px 0', textAlign: 'left',
                  borderBottom: '1px solid var(--color-border)', cursor: 'pointer',
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 14, color: 'var(--color-text-3)', fontVariantNumeric: 'tabular-nums', minWidth: 16 }}>
                  {i + 1}
                </span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{q}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
