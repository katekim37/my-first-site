"use client";

import React, { useState, useEffect, useRef } from "react";

type ThemeName = "midnight" | "cyberpunk" | "emerald" | "light";

interface ToastState {
  show: boolean;
  message: string;
  icon: string;
}

export default function HomePage() {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("midnight");

  // Toast state
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    icon: "✨",
  });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Counter state
  const [counter, setCounter] = useState<number>(0);
  const [isCounterBouncing, setIsCounterBouncing] = useState<boolean>(false);

  // System stats state
  const [hostText, setHostText] = useState<string>("localhost:3000");
  const [platformText, setPlatformText] = useState<string>("Web Client");
  const [uptime, setUptime] = useState<string>("00:00:00");
  const startTimeRef = useRef<number>(Date.now());

  // Note area state
  const [noteContent, setNoteContent] = useState<string>("");
  const [noteStatus, setNoteStatus] = useState<string>("자동 저장 준비");
  const noteDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Snippet copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Confetti canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);

  // Toast helper
  const showToast = (message: string, icon = "✨") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, icon });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2800);
  };

  // Confetti Particle System
  const launchConfetti = (
    originX?: number,
    originY?: number,
    count = 70
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = originX ?? window.innerWidth / 2;
    const y = originY ?? window.innerHeight * 0.4;
    const colors = [
      "#B1F8F2",
      "#BCD39C",
      "#FFFC99",
      "#EAFDCF",
      "#8E8358",
      "#4ABDB5",
    ];

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        size: Math.random() * 8 + 6,
        speedX: (Math.random() - 0.5) * 12,
        speedY: Math.random() * -12 - 4,
        gravity: 0.35,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        decay: Math.random() * 0.015 + 0.01,
      });
    }

    if (!animationFrameRef.current) {
      animateConfetti();
    }
  };

  const animateConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.speedY += p.gravity;
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(p.opacity, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();

      if (p.opacity <= 0 || p.y > canvas.height + 20) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animateConfetti);
    } else {
      animationFrameRef.current = null;
    }
  };

  // Change Theme
  const handleApplyTheme = (themeName: ThemeName) => {
    setCurrentTheme(themeName);
    document.body.setAttribute("data-theme", themeName);
    localStorage.setItem("my_site_theme", themeName);

    const themeNames: Record<ThemeName, string> = {
      midnight: "프레시 네이처 🌿",
      cyberpunk: "아이시 아쿠아 💧",
      emerald: "셀라돈 그린 🌾",
      light: "라임 크림 🍋",
    };
    showToast(`${themeNames[themeName]} 테마가 적용되었습니다.`);
  };

  // Counter logic
  const handleUpdateCounter = (newVal: number) => {
    setCounter(newVal);
    setIsCounterBouncing(true);
    setTimeout(() => setIsCounterBouncing(false), 150);

    if (newVal > 0 && newVal % 10 === 0) {
      launchConfetti();
      showToast(`${newVal} 클릭 마일스톤 달성!`, "🎯");
    }
  };

  // Note input handler
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    setNoteStatus("저장 중...");

    if (noteDebounceRef.current) clearTimeout(noteDebounceRef.current);
    noteDebounceRef.current = setTimeout(() => {
      localStorage.setItem("my_site_notes", val);
      setNoteStatus("자동 저장 완료 ✓");
    }, 500);
  };

  // Copy Snippet handler
  const handleCopySnippet = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      showToast("클립보드에 코드가 복사되었습니다! 📋", "✓");
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Mount effects
  useEffect(() => {
    // 1. Initial theme
    const savedTheme = (localStorage.getItem("my_site_theme") as ThemeName) || "midnight";
    setCurrentTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);

    // 2. Initial note
    const savedNote = localStorage.getItem("my_site_notes");
    if (savedNote) {
      setNoteContent(savedNote);
      setNoteStatus("자동 저장 완료 ✓");
    }

    // 3. Canvas resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // 4. Host info
    if (typeof window !== "undefined") {
      setHostText(window.location.host || "vercel.app");
      const ua = navigator.userAgent;
      let browser = "Web Client";
      if (ua.includes("Chrome")) browser = "Google Chrome";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Firefox")) browser = "Firefox";
      setPlatformText(`${browser} (${navigator.platform || "Next.js"})`);
    }

    // 5. Uptime timer
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const hrs = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const secs = String(elapsed % 60).padStart(2, "0");
      setUptime(`${hrs}:${mins}:${secs}`);
    }, 1000);

    // 6. Welcome confetti
    const timer = setTimeout(() => {
      launchConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 60);
    }, 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      clearTimeout(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Ambient Animated Glowing Background */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        id="confettiCanvas"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 999,
        }}
      ></canvas>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container nav-container">
          <a href="#" className="logo" id="logoLink">
            <div className="logo-icon">✨</div>
            <span>MyFirstSite</span>
          </a>

          <ul className="nav-links">
            <li><a href="#hero">홈</a></li>
            <li><a href="#playground">플레이그라운드</a></li>
            <li><a href="#guide">가이드</a></li>
            <li><a href="#stats">서버 상태</a></li>
          </ul>

          <div className="nav-actions">
            {/* Live Status Indicator */}
            <div
              className="status-pill"
              id="serverStatusPill"
              title="Next.js 서버 정상 작동 중"
            >
              <span className="status-dot"></span>
              <span id="serverPortText">{hostText}</span>
            </div>

            {/* Quick Theme Switcher */}
            <div className="theme-selector" role="group" aria-label="테마 선택">
              <button
                className={`theme-btn ${currentTheme === "midnight" ? "active" : ""}`}
                onClick={() => handleApplyTheme("midnight")}
                title="프레시 네이처"
              >
                🌿
              </button>
              <button
                className={`theme-btn ${currentTheme === "cyberpunk" ? "active" : ""}`}
                onClick={() => handleApplyTheme("cyberpunk")}
                title="아이시 아쿠아"
              >
                💧
              </button>
              <button
                className={`theme-btn ${currentTheme === "emerald" ? "active" : ""}`}
                onClick={() => handleApplyTheme("emerald")}
                title="셀라돈 그린"
              >
                🌾
              </button>
              <button
                className={`theme-btn ${currentTheme === "light" ? "active" : ""}`}
                onClick={() => handleApplyTheme("light")}
                title="라임 크림"
              >
                🍋
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="container hero-section" id="hero">
          <div className="hero-content">
            <div className="hero-badge-wrap">
              <div className="hero-pill">
                <span>🚀</span>
                <span>첫 웹사이트 프로젝트 시작</span>
              </div>
              <span className="status-pill">
                <span className="status-dot"></span>
                <span>Next.js 런타임 정상 실행 중</span>
              </span>
            </div>

            <h1 className="hero-title">
              <span className="hero-line">방가워요</span>
              <span className="hero-line">
                <span className="highlight-name">소피아</span>입니다
              </span>
            </h1>

            <div className="hero-avatar-wrap">
              <img
                src="/profile.jpg"
                alt="소피아 프로필 사진"
                className="hero-avatar"
                id="heroProfileImg"
                onError={(e) => {
                  // Fallback to /assets/profile.jpg
                  const target = e.currentTarget;
                  if (!target.src.includes("/assets/")) {
                    target.src = "/assets/profile.jpg";
                  }
                }}
              />
            </div>

            <p className="hero-desc">
              Next.js 웹 애플리케이션으로 성공적으로 전환되었습니다! 컴포넌트, 스타일, 인터랙션을 자유롭게 확장하여 나만의 멋진 포트폴리오를 만들어보세요.
            </p>

            <div className="hero-cta">
              <button
                className="btn btn-primary"
                id="btnCelebrate"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);
                  showToast("축하합니다! Next.js 정상 배포 완료! 🎉", "🚀");
                }}
              >
                <span>🎉 시작 축하 파티클 터뜨리기</span>
              </button>
              <a href="#playground" className="btn btn-secondary" id="btnExplore">
                <span>인터랙티브 기능 둘러보기 ↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* Interactive Playground Section */}
        <section className="container playground-section" id="playground">
          <div className="section-header">
            <span className="section-tag">Interactive Features</span>
            <h2 className="section-title">인터랙티브 플레이그라운드</h2>
            <p className="section-desc">
              리액트의 역동적인 상태 관리를 직접 경험해보세요. 버튼을 누르고 테마를 바꾸며 실시간 인터랙션을 확인해보세요.
            </p>
          </div>

          <div className="playground-grid">
            {/* Card 1: Interactive Click Counter */}
            <article className="card" id="cardCounter">
              <div className="card-header">
                <div className="card-icon">⚡</div>
                <div>
                  <h3 className="card-title">클릭 인터랙션 & 카운터</h3>
                  <p className="card-desc">숫자를 올려보세요. 10단위마다 특별한 축하 효과가 나타납니다!</p>
                </div>
              </div>

              <div className="counter-box">
                <div
                  className="counter-value"
                  id="counterDisplay"
                  style={{
                    transform: isCounterBouncing ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  {counter}
                </div>
                <div className="counter-controls">
                  <button
                    className="counter-btn"
                    onClick={() => handleUpdateCounter(counter - 1)}
                    title="1 감소"
                    aria-label="감소"
                  >
                    -
                  </button>
                  <button
                    className="counter-btn counter-reset"
                    onClick={() => {
                      handleUpdateCounter(0);
                      showToast("카운터가 리셋되었습니다.", "🔄");
                    }}
                    title="초기화"
                  >
                    Reset
                  </button>
                  <button
                    className="counter-btn"
                    onClick={() => handleUpdateCounter(counter + 1)}
                    title="1 증가"
                    aria-label="증가"
                  >
                    +
                  </button>
                </div>
                <div className="milestone-badge" id="milestoneBadge">
                  {counter === 0
                    ? "시작 버튼을 눌러보세요!"
                    : counter % 10 === 0
                    ? `🎯 대단해요! ${counter} 달성!`
                    : `현재 카운트: ${counter}`}
                </div>
              </div>
            </article>

            {/* Card 2: Live Server & System Stats */}
            <article className="card" id="stats">
              <div className="card-header">
                <div className="card-icon">📊</div>
                <div>
                  <h3 className="card-title">서버 & 런타임 현황</h3>
                  <p className="card-desc">현재 실행 중인 Next.js 및 브라우저 호스팅 정보입니다.</p>
                </div>
              </div>

              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-label"><span>🌐</span> 호스트 주소</span>
                  <span className="stat-value stat-highlight" id="statHost">{hostText}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label"><span>⏱️</span> 접속 유지 시간</span>
                  <span className="stat-value" id="statUptime">{uptime}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label"><span>💻</span> 브라우저 환경</span>
                  <span className="stat-value" id="statPlatform">{platformText}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label"><span>⚡</span> 렌더링 프레임워크</span>
                  <span className="stat-value stat-highlight">Next.js App Router (React 19)</span>
                </div>
              </div>
            </article>

            {/* Card 3: Theme Customizer */}
            <article className="card" id="cardThemes">
              <div className="card-header">
                <div className="card-icon">🎨</div>
                <div>
                  <h3 className="card-title">실시간 테마 커스텀</h3>
                  <p className="card-desc">원하는 분위기의 컬러 팔레트를 선택해보세요.</p>
                </div>
              </div>

              <div className="theme-palette-grid">
                <div
                  className={`theme-choice-card ${currentTheme === "midnight" ? "active" : ""}`}
                  onClick={() => handleApplyTheme("midnight")}
                >
                  <div className="theme-preview-dots">
                    <span className="theme-dot" style={{ background: "#EAFDCF", border: "1px solid #bcd39c" }}></span>
                    <span className="theme-dot" style={{ background: "#B1F8F2" }}></span>
                    <span className="theme-dot" style={{ background: "#BCD39C" }}></span>
                  </div>
                  <span className="theme-choice-name">프레시 네이처 🌿</span>
                </div>

                <div
                  className={`theme-choice-card ${currentTheme === "cyberpunk" ? "active" : ""}`}
                  onClick={() => handleApplyTheme("cyberpunk")}
                >
                  <div className="theme-preview-dots">
                    <span className="theme-dot" style={{ background: "#D4FCF8", border: "1px solid #4ABDB5" }}></span>
                    <span className="theme-dot" style={{ background: "#4ABDB5" }}></span>
                    <span className="theme-dot" style={{ background: "#BCD39C" }}></span>
                  </div>
                  <span className="theme-choice-name">아이시 아쿠아 💧</span>
                </div>

                <div
                  className={`theme-choice-card ${currentTheme === "emerald" ? "active" : ""}`}
                  onClick={() => handleApplyTheme("emerald")}
                >
                  <div className="theme-preview-dots">
                    <span className="theme-dot" style={{ background: "#EEF7E0", border: "1px solid #8FB870" }}></span>
                    <span className="theme-dot" style={{ background: "#6DA048" }}></span>
                    <span className="theme-dot" style={{ background: "#B1F8F2" }}></span>
                  </div>
                  <span className="theme-choice-name">셀라돈 그린 🌾</span>
                </div>

                <div
                  className={`theme-choice-card ${currentTheme === "light" ? "active" : ""}`}
                  onClick={() => handleApplyTheme("light")}
                >
                  <div className="theme-preview-dots">
                    <span className="theme-dot" style={{ background: "#FFFDE6", border: "1px solid #D4C850" }}></span>
                    <span className="theme-dot" style={{ background: "#B8B500" }}></span>
                    <span className="theme-dot" style={{ background: "#4ABDB5" }}></span>
                  </div>
                  <span className="theme-choice-name">라임 크림 🍋</span>
                </div>
              </div>
            </article>

            {/* Card 4: Quick Scratchpad / LocalStorage */}
            <article className="card" id="cardNotes">
              <div className="card-header">
                <div className="card-icon">📝</div>
                <div>
                  <h3 className="card-title">개발 아이디어 메모장</h3>
                  <p className="card-desc">입력하는 즉시 브라우저 저장소(localStorage)에 자동 저장됩니다.</p>
                </div>
              </div>

              <div className="note-container">
                <textarea
                  id="quickNoteArea"
                  className="note-input"
                  placeholder="여기에 만들고 싶은 사이트 아이디어나 할 일(To-do)을 적어보세요..."
                  value={noteContent}
                  onChange={handleNoteChange}
                ></textarea>
                <div className="note-footer">
                  <span id="noteCharCount">{noteContent.length}자 입력됨</span>
                  <span id="noteSaveStatus">{noteStatus}</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Project Guide Section */}
        <section className="container guide-section" id="guide">
          <div className="section-header">
            <span className="section-tag">Getting Started</span>
            <h2 className="section-title">다음 단계는 무엇인가요?</h2>
            <p className="section-desc">
              내 손으로 직접 코드를 바꾸어보고 화면이 즉시 바뀌는 마법을 확인해보세요.
            </p>
          </div>

          <div className="guide-grid">
            {/* Guide 1 */}
            <article className="guide-card" id="guideHtml">
              <div className="guide-number">01</div>
              <div className="guide-icon">⚛️</div>
              <h3 className="guide-card-title">Next.js 페이지 수정하기</h3>
              <p className="guide-card-desc">
                <span className="code-badge">src/app/page.tsx</span> 파일을 열고 제목, 소개 문구, 프로필 등을 내 것으로 바꾸어 보세요.
              </p>
              <div className="snippet-box">
                <button
                  className="copy-btn"
                  onClick={() => handleCopySnippet("s1", "<h1>소피아의 Next.js 포트폴리오</h1>")}
                >
                  {copiedKey === "s1" ? "복사됨!" : "복사"}
                </button>
                <div className="snippet-content">
                  {"<h1>소피아의 Next.js 포트폴리오</h1>"}
                </div>
              </div>
            </article>

            {/* Guide 2 */}
            <article className="guide-card" id="guideCss">
              <div className="guide-number">02</div>
              <div className="guide-icon">🎨</div>
              <h3 className="guide-card-title">글로벌 스타일 꾸미기</h3>
              <p className="guide-card-desc">
                <span className="code-badge">src/app/globals.css</span>의 <code>:root</code> 변수를 변경하여 나만의 시그니처 색상을 입혀보세요.
              </p>
              <div className="snippet-box">
                <button
                  className="copy-btn"
                  onClick={() => handleCopySnippet("s2", "--accent-primary: #4abdb5;")}
                >
                  {copiedKey === "s2" ? "복사됨!" : "복사"}
                </button>
                <div className="snippet-content">
                  {"--accent-primary: #4abdb5;"}
                </div>
              </div>
            </article>

            {/* Guide 3 */}
            <article className="guide-card" id="guideJs">
              <div className="guide-number">03</div>
              <div className="guide-icon">🚀</div>
              <h3 className="guide-card-title">새로운 컴포넌트 추가</h3>
              <p className="guide-card-desc">
                <span className="code-badge">src/components/</span> 폴더를 만들어 나만의 모듈형 리액트 컴포넌트를 조립해보세요.
              </p>
              <div className="snippet-box">
                <button
                  className="copy-btn"
                  onClick={() => handleCopySnippet("s3", "export default function Widget() { return <div>My Widget</div> }")}
                >
                  {copiedKey === "s3" ? "복사됨!" : "복사"}
                </button>
                <div className="snippet-content">
                  {"export default function Widget() { ... }"}
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? "show" : ""}`} id="toast" role="alert" aria-live="polite">
        <span id="toastIcon">{toast.icon}</span>
        <span id="toastMsg">{toast.message}</span>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-text">
            © 2026 <strong>MyFirstSite</strong> • Next.js App Router로 Vercel에 안전하게 배포되었습니다.
          </div>
          <div className="footer-links">
            <a href="#hero" className="footer-link">맨 위로</a>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Next.js 공식 문서
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
