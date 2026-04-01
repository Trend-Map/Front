import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const mainClassName = `app-shell-main${isHome ? ' app-shell-main-home' : ''}`;

  return (
    <div className={`app-shell${isHome ? ' app-shell-home' : ''}`}>
      <style>{`
        .app-shell {
          --app-header-offset: 96px;
          --app-bottom-offset: 104px;
          min-height: 100vh;
          background:
            radial-gradient(circle at 82% 16%, rgba(59, 130, 246, 0.08), transparent 20%),
            linear-gradient(180deg, #fbfcff 0%, #ffffff 52%, #f5f8fd 100%);
        }

        .app-shell-home {
          background: transparent;
        }

        .app-shell-main {
          min-height: 100vh;
          padding-top: clamp(0px, 1px, 1px);
        }

        @media (min-width: 769px) {
          .app-shell-main { padding-top: var(--app-header-offset) !important; }
          .app-shell-main-home { padding-top: 0 !important; }
        }

        @media (max-width: 768px) {
          .app-shell-main {
            padding-bottom: calc(var(--app-bottom-offset) + env(safe-area-inset-bottom)) !important;
          }
          .app-shell-main-home { padding-bottom: 0 !important; }
        }
      `}</style>
      {!isHome ? <Header /> : null}
      <main className={mainClassName}>
        {children}
      </main>
      {!isHome ? <BottomNav /> : null}
    </div>
  );
}
