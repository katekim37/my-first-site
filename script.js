/**
 * My First Site - Interactive Client Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification Utility
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer = null;

  function showToast(message, icon = '✨') {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = message;
    toastIcon.textContent = icon;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 2. Confetti Particle System
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 6;
      this.speedX = (Math.random() - 0.5) * 12;
      this.speedY = Math.random() * -12 - 4;
      this.gravity = 0.35;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 10;
      const colors = ['#B1F8F2', '#BCD39C', '#FFFC99', '#EAFDCF', '#8E8358', '#4ABDB5'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = 1;
      this.decay = Math.random() * 0.015 + 0.01;
    }

    update() {
      this.speedY += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(this.opacity, 0);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      ctx.restore();
    }
  }

  function launchConfetti(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 70) {
    for (let i = 0; i < count; i++) {
      particles.push(new ConfettiParticle(originX, originY));
    }
    if (!animationId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.opacity <= 0 || p.y > canvas.height + 20) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animateConfetti);
    } else {
      animationId = null;
    }
  }

  // Celebrate Button in Hero
  const btnCelebrate = document.getElementById('btnCelebrate');
  if (btnCelebrate) {
    btnCelebrate.addEventListener('click', (e) => {
      const rect = btnCelebrate.getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);
      showToast('성공적으로 로컬 서버가 작동 중입니다! 🎉', '🚀');
    });
  }

  // 3. Interactive Counter
  let counter = 0;
  const counterDisplay = document.getElementById('counterDisplay');
  const btnIncrement = document.getElementById('btnIncrement');
  const btnDecrement = document.getElementById('btnDecrement');
  const btnReset = document.getElementById('btnReset');
  const milestoneBadge = document.getElementById('milestoneBadge');

  function updateCounter(val) {
    counter = val;
    counterDisplay.textContent = counter;
    counterDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
      counterDisplay.style.transform = 'scale(1)';
    }, 150);

    if (counter > 0 && counter % 10 === 0) {
      milestoneBadge.textContent = `🎯 대단해요! ${counter} 달성!`;
      const rect = counterDisplay.getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top, 50);
      showToast(`${counter} 클릭 마일스톤 달성!`, '🎯');
    } else if (counter === 0) {
      milestoneBadge.textContent = '버튼을 눌러 숫자를 변경해보세요.';
    } else {
      milestoneBadge.textContent = `현재 카운트: ${counter}`;
    }
  }

  btnIncrement.addEventListener('click', () => updateCounter(counter + 1));
  btnDecrement.addEventListener('click', () => updateCounter(counter - 1));
  btnReset.addEventListener('click', () => {
    updateCounter(0);
    showToast('카운터가 리셋되었습니다.', '🔄');
  });

  // 4. Live Server Stats & Uptime
  const startTime = Date.now();
  const statUptime = document.getElementById('statUptime');
  const statHost = document.getElementById('statHost');
  const serverPortText = document.getElementById('serverPortText');

  // Update current host in stats
  if (window.location.host) {
    statHost.textContent = `http://${window.location.host}`;
    serverPortText.textContent = window.location.host;
  }

  const statPlatform = document.getElementById('statPlatform');
  if (statPlatform) {
    const navUserAgent = navigator.userAgent;
    let browser = 'Modern Browser';
    if (navUserAgent.includes('Chrome')) browser = 'Google Chrome';
    else if (navUserAgent.includes('Safari')) browser = 'Safari';
    else if (navUserAgent.includes('Firefox')) browser = 'Firefox';
    statPlatform.textContent = `${browser} (${navigator.platform || 'Win32'})`;
  }

  function updateUptime() {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const hrs = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsedSeconds % 60).padStart(2, '0');
    if (statUptime) statUptime.textContent = `${hrs}:${mins}:${secs}`;
  }
  setInterval(updateUptime, 1000);
  updateUptime();

  // 5. Theme Switching
  const themeBtns = document.querySelectorAll('[data-theme-target]');
  const themeChoices = document.querySelectorAll('[data-set-theme]');
  const savedTheme = localStorage.getItem('my_site_theme') || 'midnight';

  function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('my_site_theme', themeName);

    themeBtns.forEach((btn) => {
      if (btn.getAttribute('data-theme-target') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const themeNames = {
      midnight: '프레시 네이체 🌿',
      cyberpunk: '아이시 아쿠아 💧',
      emerald: '셀라도 그린 🌾',
      light: '라임 크림 🍋'
    };
    showToast(`${themeNames[themeName] || themeName} 테마가 적용되었습니다.`);
  }

  // Initial load
  applyTheme(savedTheme);

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-target');
      applyTheme(theme);
    });
  });

  themeChoices.forEach((card) => {
    card.addEventListener('click', () => {
      const theme = card.getAttribute('data-set-theme');
      applyTheme(theme);
    });
  });

  // 6. Scratchpad / Note Area with localStorage
  const noteArea = document.getElementById('quickNoteArea');
  const noteCharCount = document.getElementById('noteCharCount');
  const noteSaveStatus = document.getElementById('noteSaveStatus');

  const savedNote = localStorage.getItem('my_site_notes');
  if (savedNote && noteArea) {
    noteArea.value = savedNote;
    noteCharCount.textContent = `${savedNote.length}자 입력됨`;
  }

  let noteDebounce = null;
  if (noteArea) {
    noteArea.addEventListener('input', () => {
      const val = noteArea.value;
      noteCharCount.textContent = `${val.length}자 입력됨`;
      noteSaveStatus.textContent = '저장 중...';

      clearTimeout(noteDebounce);
      noteDebounce = setTimeout(() => {
        localStorage.setItem('my_site_notes', val);
        noteSaveStatus.textContent = '자동 저장 완료 ✓';
      }, 500);
    });
  }

  // 7. Copy Snippets
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
          const originalText = btn.textContent;
          btn.textContent = '복사됨!';
          showToast('클립보드에 코드가 복사되었습니다! 📋', '✓');
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        });
      }
    });
  });

  // Welcome Confetti on first load
  setTimeout(() => {
    launchConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 60);
  }, 400);
});
