import { useNavigate } from 'react-router-dom';

interface RelatedKeywordsProps {
  keywords: string[];
  label?: string;
}

export default function RelatedKeywords({ keywords, label }: RelatedKeywordsProps) {
  const navigate = useNavigate();
  if (keywords.length === 0) return null;

  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em' }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {keywords.map(kw => (
          <button
            key={kw}
            onClick={() => navigate(`/search?q=${encodeURIComponent(kw)}`)}
            style={{
              fontSize: 12, fontWeight: 700, padding: '6px 14px',
              border: '1px solid var(--color-border)', borderRadius: 999,
              background: 'var(--color-bg)', color: 'var(--color-text-2)',
              cursor: 'pointer', transition: 'all 0.1s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--color-text)';
              e.currentTarget.style.color = 'var(--color-bg)';
              e.currentTarget.style.borderColor = 'var(--color-text)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--color-bg)';
              e.currentTarget.style.color = 'var(--color-text-2)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  );
}
