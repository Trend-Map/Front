import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import HomePage from './pages/HomePage';
import TrendTopPage from './pages/TrendTopPage';
import TrendDetailPage from './pages/TrendDetailPage';
import CommunityListPage from './pages/CommunityListPage';
import CommunityWritePage from './pages/CommunityWritePage';
import CommunityPostPage from './pages/CommunityPostPage';
import SearchPage from './pages/SearchPage';
import PlaceRegisterPage from './pages/PlaceRegisterPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import OwnerClaimPage from './pages/OwnerClaimPage';

function NotFound() {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontWeight: 900, fontSize: 64, color: 'var(--color-surface)', marginBottom: 16, fontVariantNumeric: 'tabular-nums' }}>
        404
      </div>
      <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 12, letterSpacing: '-0.02em' }}>
        페이지를 찾을 수 없습니다
      </h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 24 }}>
        요청하신 페이지가 존재하지 않거나 이동되었습니다
      </p>
      <a href="/" style={{ fontWeight: 700, color: 'var(--color-accent)', fontSize: 14 }}>
        홈으로 돌아가기 →
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ranking" element={<TrendTopPage />} />
          <Route path="/maps/:trendId" element={<TrendDetailPage />} />
          <Route path="/community" element={<CommunityListPage />} />
          <Route path="/community/write" element={<CommunityWritePage />} />
          <Route path="/community/posts/:postId" element={<CommunityPostPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/places/new" element={<PlaceRegisterPage />} />
          <Route path="/places/:placeId" element={<PlaceDetailPage />} />
          <Route path="/owner/claim" element={<OwnerClaimPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
