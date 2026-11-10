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

  // Inquiry Modal State
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    category: "프로젝트 협업",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      showToast("클립보드에 복사되었습니다! 📋", "✓");
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Inquiry Submit handler (Resend API 연동)
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name.trim()) {
      showToast("성함 또는 닉네임을 입력해 주세요.", "⚠️");
      return;
    }
    if (!inquiryForm.email.trim() || !inquiryForm.email.includes("@")) {
      showToast("올바른 이메일 형식을 입력해 주세요.", "⚠️");
      return;
    }
    if (!inquiryForm.message.trim()) {
      showToast("문의 내용을 입력해 주세요.", "⚠️");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryForm),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "이메일 전송에 실패했습니다.", "❌");
        setIsSubmitting(false);
        return;
      }

      // 로컬 스토리지에도 문의 내역 기록
      try {
        const existing = JSON.parse(
          localStorage.getItem("my_site_inquiries") || "[]"
        );
        existing.push({
          ...inquiryForm,
          createdAt: new Date().toISOString(),
          sentViaResend: data.mode === "resend",
        });
        localStorage.setItem("my_site_inquiries", JSON.stringify(existing));
      } catch (err) {
        console.error("문의 로컬 저장 오류:", err);
      }

      setIsSubmitting(false);
      setIsInquiryOpen(false);
      setInquiryForm({
        name: "",
        email: "",
        category: "프로젝트 협업",
        message: "",
      });
      launchConfetti();

      if (data.mode === "resend") {
        showToast("Resend를 통해 문의 이메일이 발송되었습니다! 💌", "🚀");
      } else {
        showToast("문의가 접수되었습니다! (.env.local에 API 키 입력 시 실제 메일 발송)", "✨");
      }
    } catch (err) {
      console.error("문의 전송 통신 오류:", err);
      showToast("전송 중 네트워크 오류가 발생했습니다.", "⚠️");
      setIsSubmitting(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isInquiryOpen) {
        setIsInquiryOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInquiryOpen]);

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
            <li><a href="#playground">소개 & 기능</a></li>
            <li><a href="#projects">프로젝트</a></li>
            <li>
              <button
                id="btnInquiryNav"
                className="nav-inquiry-btn"
                onClick={() => setIsInquiryOpen(true)}
              >
                <span>문의하기</span>
                <span style={{ fontSize: "1rem" }}>✉️</span>
              </button>
            </li>
          </ul>

          <div className="nav-actions">
            {/* Live Status Indicator */}
            <div
              className="status-pill"
              id="serverStatusPill"
              title="소피아의 웹 공간에 오신 것을 환영합니다"
            >
              <span className="status-dot"></span>
              <span id="serverPortText">방문 환영 🌿</span>
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
                <span>✨</span>
                <span>소피아의 개인 웹 공간</span>
              </div>
              <span className="status-pill">
                <span className="status-dot"></span>
                <span>새로운 만남 & 협업 환영</span>
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
                title="소피아를 클릭하면 축하 파티클이 터집니다 🎉"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
                  showToast("소피아의 공간에 오신 것을 환영해요! 🎉", "✨");
                }}
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
              안녕하세요! [ ] 분야에서 [ ]을 만들어가는 소피아입니다.
              다양한 인터랙션과 작업물을 둘러보시고 언제든 편하게 이야기 나눠요.
            </p>

            <div className="hero-cta">
              <a href="#projects" className="btn btn-primary" id="btnExplore">
                <span>프로젝트 둘러보기 ↓</span>
              </a>
              <button
                className="btn btn-inquiry"
                id="btnInquiryHero"
                onClick={() => setIsInquiryOpen(true)}
              >
                <span>문의사항 남기기</span>
                <span className="arrow-icon">&gt;</span>
              </button>
              <button
                className="btn btn-secondary"
                id="btnCelebrate"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
                  showToast("기분 좋은 하루 보내세요! 🎉", "✨");
                }}
              >
                <span>🎉 환영 축하하기</span>
              </button>
            </div>
          </div>
        </section>

        {/* Interactive Playground Section */}
        <section className="container playground-section" id="playground">
          <div className="section-header">
            <span className="section-tag">Interactive Features</span>
            <h2 className="section-title">소피아의 인터랙티브 룸</h2>
            <p className="section-desc">
              직접 클릭하고 체험해볼 수 있는 반응형 인터랙션 공간입니다. 테마를 바꾸고 소피아에게 응원의 메시지를 남겨보세요.
            </p>
          </div>

          <div className="playground-grid">
            {/* Card 1: Interactive Click Counter */}
            <article className="card" id="cardCounter">
              <div className="card-header">
                <div className="card-icon">💖</div>
                <div>
                  <h3 className="card-title">소피아 응원 카운터</h3>
                  <p className="card-desc">버튼을 눌러 응원을 보내주세요! 10단위마다 특별한 축하 효과가 나타납니다.</p>
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
                    ? "응원 버튼을 눌러보세요!"
                    : counter % 10 === 0
                    ? `🎯 따뜻한 응원 감사합니다! ${counter}개 달성!`
                    : `현재 누적 응원: ${counter}개`}
                </div>
              </div>
            </article>

            {/* Card 2: Profile & Info */}
            <article className="card" id="stats">
              <div className="card-header">
                <div className="card-icon">👤</div>
                <div>
                  <h3 className="card-title">소피아 프로필 & 활동 정보</h3>
                  <p className="card-desc">소피아에 대한 기본 정보와 주요 관심 분야입니다.</p>
                </div>
              </div>

              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-label"><span>🏷️</span> 활동 분야</span>
                  <span className="stat-value stat-highlight">[ ]</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label"><span>📍</span> 거점 / 활동 지역</span>
                  <span className="stat-value">[ ]</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label"><span>💡</span> 관심 기술</span>
                  <span className="stat-value stat-highlight">Next.js, React, 웹 인터랙션, [ ]</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label"><span>⏱️</span> 사이트 체류 시간</span>
                  <span className="stat-value" id="statUptime">{uptime}</span>
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
                  <h3 className="card-title">방명록 & 응원 메모장</h3>
                  <p className="card-desc">소피아에게 남기고 싶은 메모나 응원을 적어보세요. (브라우저에 자동 저장)</p>
                </div>
              </div>

              <div className="note-container">
                <textarea
                  id="quickNoteArea"
                  className="note-input"
                  placeholder="소피아에게 전하고 싶은 이야기나 응원의 한마디를 적어보세요..."
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

        {/* Project Section */}
        <section className="container guide-section" id="projects">
          <div className="section-header">
            <span className="section-tag">Projects & Story</span>
            <h2 className="section-title">소피아의 프로젝트 & 스토리</h2>
            <p className="section-desc">
              소피아가 직접 구상하고 만들어가는 작업물과 여정을 소개합니다.
            </p>
          </div>

          <div className="guide-grid">
            {/* Project 1 */}
            <article className="guide-card" id="project1">
              <div className="guide-number">01</div>
              <div className="guide-icon">🚀</div>
              <h3 className="guide-card-title">마이 퍼스트 사이트 (MyFirstSite)</h3>
              <p className="guide-card-desc">
                Next.js App Router와 React 19 기반의 모던 인터랙티브 웹 공간입니다. 감각적인 테마 시스템과 반응형 디자인, 문의 모달을 구현했습니다.
              </p>
              <div className="snippet-box">
                <div className="snippet-content" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                  {"#Next.js #React #인터랙티브 #포트폴리오"}
                </div>
              </div>
            </article>

            {/* Project 2 */}
            <article className="guide-card" id="project2">
              <div className="guide-number">02</div>
              <div className="guide-icon">💡</div>
              <h3 className="guide-card-title">[두 번째 프로젝트명]</h3>
              <p className="guide-card-desc">
                [프로젝트에 대한 간단한 소개와 역할을 적어주세요. 멋진 성과나 기능을 함께 기록하면 좋습니다.]
              </p>
              <div className="snippet-box">
                <div className="snippet-content" style={{ color: "var(--text-secondary)" }}>
                  {"#[주요기술] #[역할] #[ ]"}
                </div>
              </div>
            </article>

            {/* Project 3 */}
            <article className="guide-card" id="project3">
              <div className="guide-number">03</div>
              <div className="guide-icon">🌱</div>
              <h3 className="guide-card-title">[관심 분야 / 진행 예정 작업]</h3>
              <p className="guide-card-desc">
                [소피아가 새롭게 도전하고 싶은 분야나 앞으로 오픈할 서비스/스터디 계획을 적어주세요.]
              </p>
              <div className="snippet-box">
                <div className="snippet-content" style={{ color: "var(--text-secondary)" }}>
                  {"#[새로운도전] #[ ]"}
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
            © 2026 <strong>소피아 (Sophia)</strong> • 모든 방문을 진심으로 환영합니다.
          </div>
          <div className="footer-links">
            <a href="#hero" className="footer-link">맨 위로 ↑</a>
            <button
              className="footer-link"
              onClick={() => setIsInquiryOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
                padding: 0,
              }}
            >
              소피아에게 문의하기
            </button>
          </div>
        </div>
      </footer>

      {/* Inquiry Modal Popup */}
      {isInquiryOpen && (
        <div
          className="modal-backdrop"
          id="inquiryModalBackdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsInquiryOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiryModalTitle"
        >
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-header-text">
                <h3 className="modal-title" id="inquiryModalTitle">
                  <span>💌</span> 문의사항 남기기
                </h3>
                <p className="modal-subtitle">
                  소피아에게 전하고 싶은 메시지나 협업 제안을 자유롭게 남겨주세요.
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsInquiryOpen(false)}
                title="닫기 (Esc)"
                aria-label="모달 닫기"
              >
                ✕
              </button>
            </div>

            <form className="inquiry-form" onSubmit={handleInquirySubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="inquiryName">
                  <span>👤 성함 / 닉네임</span>
                  <span className="required">*</span>
                </label>
                <input
                  id="inquiryName"
                  type="text"
                  className="form-input"
                  placeholder="예: 홍길동"
                  value={inquiryForm.name}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="inquiryEmail">
                  <span>✉️ 연락받으실 이메일</span>
                  <span className="required">*</span>
                </label>
                <input
                  id="inquiryEmail"
                  type="email"
                  className="form-input"
                  placeholder="예: contact@example.com"
                  value={inquiryForm.email}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>🏷️ 문의 유형</span>
                </label>
                <div className="category-chips">
                  {["프로젝트 협업", "아이디어 제안", "일반 문의", "응원 & 커피챗 ☕"].map(
                    (cat) => (
                      <button
                        type="button"
                        key={cat}
                        className={`category-chip ${
                          inquiryForm.category === cat ? "active" : ""
                        }`}
                        onClick={() =>
                          setInquiryForm({ ...inquiryForm, category: cat })
                        }
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="inquiryMessage">
                  <span>📝 문의 내용</span>
                  <span className="required">*</span>
                </label>
                <textarea
                  id="inquiryMessage"
                  className="form-textarea"
                  placeholder="궁금한 사항이나 나누고 싶은 이야기를 적어주세요..."
                  value={inquiryForm.message}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, message: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="direct-email-box">
                <div className="direct-email-text">
                  <span>📧 직접 이메일 보내기:</span>
                  <span className="direct-email-address">sophia@example.com</span>
                </div>
                <button
                  type="button"
                  className="email-copy-btn"
                  onClick={() =>
                    handleCopySnippet("direct-email", "sophia@example.com")
                  }
                >
                  {copiedKey === "direct-email" ? "복사됨! ✓" : "이메일 복사"}
                </button>
              </div>

              <div className="form-footer-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsInquiryOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-inquiry"
                  id="btnSubmitInquiry"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>전송 중... ⏳</span>
                  ) : (
                    <>
                      <span>문의사항 보내기</span>
                      <span className="arrow-icon">✈️</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
