import { useLocation, useNavigate } from 'react-router-dom';
import { MOBILE_NAV_ITEMS } from '../constants/navigation';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMyPage = location.pathname === '/search' && new URLSearchParams(location.search).has('my');

  const isActive = (match: string) => {
    switch (match) {
      case 'home':
        return location.pathname === '/';
      case 'trends':
        return location.pathname === '/ranking' || location.pathname.startsWith('/maps/');
      case 'community':
        return location.pathname === '/community' || location.pathname.startsWith('/community/');
      case 'search':
        return location.pathname === '/search' && !isMyPage;
      case 'my':
        return isMyPage;
      default:
        return false;
    }
  };

  return (
    <>
      <style>{`
        .app-bottom-nav {
          position: fixed;
          left: 50%;
          bottom: calc(env(safe-area-inset-bottom) + 12px);
          transform: translateX(-50%);
          width: min(720px, calc(100% - 20px));
          z-index: 100;
        }

        .app-bottom-nav__inner {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 6px;
          padding: 8px;
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.84);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(148, 163, 184, 0.18);
          box-shadow: var(--shadow-soft);
        }

        .app-bottom-nav__item {
          min-height: 56px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: #64748b;
          transition:
            background-color 180ms ease,
            color 180ms ease,
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .app-bottom-nav__item.is-active {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.14) 0%, rgba(37, 99, 235, 0.1) 100%);
          color: #1d4ed8;
          box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.14);
        }

        .app-bottom-nav__icon {
          font-size: 18px;
          line-height: 1;
        }

        .app-bottom-nav__label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
      `}</style>

      <nav className="mobile-only app-bottom-nav" aria-label="하단 메뉴">
        <div className="app-bottom-nav__inner">
          {MOBILE_NAV_ITEMS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`app-bottom-nav__item${isActive(tab.match) ? ' is-active' : ''}`}
              onClick={() => navigate(tab.to)}
              aria-label={tab.label}
            >
              <span className="app-bottom-nav__icon">{tab.icon}</span>
              <span className="app-bottom-nav__label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
