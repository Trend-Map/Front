import { useLocation, useNavigate } from 'react-router-dom';
import { ACCOUNT_ROUTE, PRIMARY_NAV_ITEMS } from '../constants/navigation';

function isPrimaryActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{`
        .app-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: var(--app-header-offset);
          background: linear-gradient(180deg, rgba(251, 252, 255, 0.94) 0%, rgba(255, 255, 255, 0.88) 100%);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .app-header__inner {
          width: min(1440px, calc(100% - 48px));
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .app-header__logo {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #0f172a;
        }

        .app-header__nav-wrap {
          display: flex;
          align-items: center;
          gap: 17px;
          margin-left: auto;
        }

        .app-header__nav {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .app-header__nav-button,
        .app-header__login {
          min-height: 48px;
          padding: 0 17px;
          border-radius: 999px;
          font-size: 17px;
          font-weight: 700;
          transition:
            background-color 180ms ease,
            color 180ms ease,
            border-color 180ms ease,
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .app-header__nav-button {
          color: #64748b;
        }

        .app-header__nav-button:hover,
        .app-header__nav-button.is-active {
          background: rgba(15, 23, 42, 0.04);
          color: #0f172a;
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
        }

        .app-header__login {
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(255, 255, 255, 0.72);
          color: #0f172a;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }

        .app-header__login:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.1);
        }
      `}</style>

      <header className="desktop-only app-header">
        <div className="app-header__inner">
          <button type="button" className="app-header__logo" onClick={() => navigate('/')}>
            트렌드 맵
          </button>

          <div className="app-header__nav-wrap">
            <nav className="app-header__nav" aria-label="메인 메뉴">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  className={`app-header__nav-button${isPrimaryActive(location.pathname, item.to) ? ' is-active' : ''}`}
                  onClick={() => navigate(item.to)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              type="button"
              className="app-header__login"
              onClick={() => navigate(ACCOUNT_ROUTE)}
              aria-label="로그인"
            >
              로그인
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
