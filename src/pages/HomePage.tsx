import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mapImage from '../assets/hero-map.png';
import pinImage from '../assets/hero-pin.png';
import { ACCOUNT_ROUTE, PRIMARY_NAV_ITEMS } from '../constants/navigation';
import { useAsync } from '../hooks/useAsync';
import { trendService } from '../services/trendService';
import type { Trend } from '../types';
import { timeAgo } from '../utils/time';

const CTA_LABEL = '지금 뜨는 트렌드 바로 보기';

const HOME_STYLES = `
  .home-landing {
    height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at 78% 28%, rgba(65, 132, 255, 0.08), transparent 22%),
      linear-gradient(180deg, #fbfcff 0%, #ffffff 52%, #f6f8fc 100%);
    color: #111827;
  }

  .home-landing__shell {
    width: min(1440px, calc(100% - 48px));
    height: 100%;
    margin: 0 auto;
    padding: 20px 0 0;
    display: flex;
    flex-direction: column;
  }

  .home-landing__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 0 0 20px;
  }

  .home-landing__logo {
    font-size: 22px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #0f172a;
  }

  .home-landing__nav-wrap {
    display: flex;
    align-items: center;
    gap: 17px;
  }

  .home-landing__nav {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .home-landing__nav-button,
  .home-landing__login {
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

  .home-landing__nav-button {
    color: #64748b;
  }

  .home-landing__nav-button:hover {
    background: rgba(15, 23, 42, 0.04);
    color: #0f172a;
  }

  .home-landing__login {
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(255, 255, 255, 0.72);
    color: #0f172a;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  }

  .home-landing__login:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.1);
  }

  .home-landing__hero {
    display: grid;
    grid-template-columns: minmax(0, 1.14fr) minmax(540px, 1.18fr);
    gap: clamp(36px, 4vw, 72px);
    align-items: center;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .home-landing__content {
    display: grid;
    gap: 34px;
    max-width: 912px;
    padding: 8px 0;
  }

  .home-landing__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #64748b;
  }

  .home-landing__eyebrow::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #3b82f6;
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.12);
  }

  .home-landing__title {
    margin: 0;
    font-size: clamp(62px, 8.4vw, 130px);
    font-weight: 900;
    line-height: 0.93;
    letter-spacing: -0.065em;
    color: #0f172a;
  }

  .home-landing__subtitle {
    display: block;
    margin-top: 12px;
    font-size: clamp(41px, 6.2vw, 79px);
    line-height: 1.04;
    color: #1e293b;
  }

  .home-landing__description {
    max-width: 38ch;
    font-size: 25px;
    line-height: 1.72;
    color: #64748b;
  }

  .home-landing__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 22px;
    max-width: 620px;
    padding-top: 6px;
    font-size: 17px;
    font-weight: 700;
    color: #475569;
  }

  .home-landing__meta strong {
    color: #0f172a;
  }

  .home-landing__cta {
    min-height: 82px;
    width: fit-content;
    padding: 0 46px;
    border-radius: 999px;
    background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
    color: #ffffff;
    font-size: 23px;
    font-weight: 800;
    box-shadow: 0 18px 36px rgba(37, 99, 235, 0.22);
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      filter 180ms ease;
  }

  .home-landing__cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 24px 42px rgba(37, 99, 235, 0.28);
    filter: saturate(1.04);
  }

  .home-landing__visual {
    position: relative;
    min-height: clamp(620px, 62vw, 840px);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    overflow: visible;
  }

  .home-landing__visual-media {
    position: relative;
    width: min(152%, 1080px);
    max-width: none;
    margin-right: -8%;
  }

  .home-landing__diorama {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(36px) scale(1.2);
    transform-origin: center top;
  }

  .home-landing__diorama::after {
    content: '';
    position: absolute;
    z-index: 0;
    left: 50%;
    bottom: clamp(10px, 1.8vw, 22px);
    width: min(72%, 720px);
    height: clamp(28px, 4vw, 56px);
    transform: translateX(-50%);
    border-radius: 999px;
    background: radial-gradient(
      ellipse at center,
      rgba(15, 23, 42, 0.22) 0%,
      rgba(15, 23, 42, 0.14) 34%,
      rgba(15, 23, 42, 0.05) 62%,
      transparent 78%
    );
    filter: blur(18px);
    opacity: 0.72;
    pointer-events: none;
  }

  .home-landing__map-image {
    position: relative;
    z-index: 1;
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 24px 36px rgba(15, 23, 42, 0.08));
  }

  .home-landing__pin {
    position: absolute;
    z-index: 2;
    left: 50.9%;
    top: 2.0%;
    width: clamp(300px, 34vw, 420px);
    transform: translateX(-50%);
    animation: home-landing-pin-float 3.4s ease-in-out infinite;
    filter: drop-shadow(0 22px 30px rgba(15, 23, 42, 0.12));
    pointer-events: none;
  }

  .home-landing__pin-image {
    width: 100%;
    height: auto;
    display: block;
  }

  @keyframes home-landing-pin-float {
    0%, 100% {
      transform: translateX(-50%) translateY(8px);
    }
    50% {
      transform: translateX(-50%) translateY(-24px);
    }
  }

  @media (max-width: 980px) {
    .home-landing__hero {
      grid-template-columns: 1fr;
      min-height: auto;
      gap: 36px;
      padding-top: 12px;
    }

    .home-landing__content {
      max-width: none;
      padding: 0;
    }

    .home-landing__visual {
      order: 2;
      min-height: 620px;
      justify-content: center;
    }

    .home-landing__visual-media {
      width: min(138%, 900px);
      margin-right: 0;
    }
  }

  @media (max-width: 720px) {
    .home-landing__shell {
      width: min(1200px, calc(100% - 24px));
      padding: 20px 0 36px;
    }

    .home-landing__header {
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 14px;
      padding-bottom: 18px;
    }

    .home-landing__nav-wrap {
      width: 100%;
      justify-content: space-between;
    }

    .home-landing__nav {
      gap: 2px;
      flex-wrap: wrap;
    }

    .home-landing__nav-button,
    .home-landing__login {
      min-height: 43px;
      padding: 0 14px;
      font-size: 16px;
    }

    .home-landing__description {
      font-size: 18px;
    }

    .home-landing__cta {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .home-landing__visual {
      min-height: 460px;
    }

    .home-landing__visual-media {
      width: min(148%, 760px);
    }

    .home-landing__pin {
      width: clamp(220px, 44vw, 300px);
      top: 3.4%;
      left: 50.6%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-landing__pin,
    .home-landing__cta,
    .home-landing__nav-button,
    .home-landing__login {
      animation: none !important;
      transition: none !important;
    }
  }
`;

function HomeVisual({ trend }: { trend: Trend }) {
  return (
    <figure
      className="home-landing__visual"
      role="img"
      aria-label={`${trend.keyword} 트렌드를 표현한 3D 도시 디오라마와 재고 지도 핀`}
    >
      <div className="home-landing__visual-media">
        <div className="home-landing__diorama" aria-hidden="true">
          <img
            className="home-landing__map-image"
            src={mapImage}
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="home-landing__pin" aria-hidden="true">
          <img
            className="home-landing__pin-image"
            src={pinImage}
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </figure>
  );
}

function HomeLoading() {
  return (
    <>
      <style>{HOME_STYLES}</style>
      <div className="home-landing">
        <div className="home-landing__shell">
          <div className="home-landing__header">
            <div className="home-landing__logo">트렌드 맵</div>
          </div>
          <div className="home-landing__hero">
            <div style={{ display: 'grid', gap: 14 }}>
              <div className="skeleton" style={{ width: 120, height: 12 }} />
              <div className="skeleton" style={{ width: '72%', height: 98 }} />
              <div className="skeleton" style={{ width: '88%', height: 74 }} />
              <div className="skeleton" style={{ width: 240, height: 54, borderRadius: 999 }} />
            </div>
            <div className="skeleton" style={{ minHeight: 420, borderRadius: 36 }} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data: trends, loading, error, refetch } = useAsync(() => trendService.getTopTrends(), []);

  useEffect(() => {
    document.title = '트렌드 맵';
  }, []);

  if (loading) {
    return <HomeLoading />;
  }

  if (error || !trends?.length) {
    return (
      <>
        <style>{HOME_STYLES}</style>
        <div className="home-landing">
          <div className="home-landing__shell">
            <header className="home-landing__header">
              <div className="home-landing__logo">트렌드 맵</div>
            </header>
            <main className="home-landing__hero">
              <section className="home-landing__content">
                <div className="home-landing__eyebrow">trend map</div>
                <h1 className="home-landing__title">
                  트렌드 맵
                  <span className="home-landing__subtitle">
                    지금 뜨는 트렌드
                    <br />
                    주변에서 구해보세요!
                  </span>
                </h1>
                <p className="home-landing__description">
                  홈 화면 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
                </p>
                <button className="home-landing__cta" onClick={refetch}>
                  다시 시도
                </button>
              </section>
            </main>
          </div>
        </div>
      </>
    );
  }

  const topTrend = trends[0];

  return (
    <>
      <style>{HOME_STYLES}</style>
      <div className="home-landing">
        <div className="home-landing__shell">
          <header className="home-landing__header">
            <div className="home-landing__logo">트렌드 맵</div>

            <div className="home-landing__nav-wrap">
              <nav className="home-landing__nav" aria-label="메인 메뉴">
                {PRIMARY_NAV_ITEMS.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    className="home-landing__nav-button"
                    onClick={() => navigate(item.to)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                type="button"
                className="home-landing__login"
                onClick={() => navigate(ACCOUNT_ROUTE)}
                aria-label="로그인"
              >
                로그인
              </button>
            </div>
          </header>

          <main className="home-landing__hero">
            <section className="home-landing__content" aria-labelledby="home-hero-title">
              <div className="home-landing__eyebrow">실시간 지역 재고 신호</div>

              <h1 id="home-hero-title" className="home-landing__title">
                트렌드 맵
              </h1>

              <p className="home-landing__description">
                두쫀쿠맵? 버터떡맵? 유행할때마다 만들어지는 맵
                <br />
                트렌드 맵에서 편하게 주변 재고를 확인하세요.
              </p>

              <button
                type="button"
                className="home-landing__cta"
                onClick={() => navigate(`/maps/${topTrend.id}`)}
              >
                {CTA_LABEL}
              </button>
            </section>

            <HomeVisual trend={topTrend} />
          </main>
        </div>
      </div>
    </>
  );
}
