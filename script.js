(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const mobileMq = window.matchMedia("(max-width: 960px)");
  const finePointerMq = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------------------------------------------------------
     01. PAGE LOADER
     가장 먼저 실행 + 다른 인터랙션 오류가 나도 무조건 빠져나오도록 fallback
     --------------------------------------------------------- */
  const loader = $(".page-loader");

  const hideLoader = () => {
    if (!loader || loader.classList.contains("is-hidden")) return;
    loader.classList.add("is-hidden");

    // 화면 밖으로 완전히 빠진 뒤 클릭/포커스 방해 방지
    window.setTimeout(() => {
      loader.style.pointerEvents = "none";
      loader.style.visibility = "hidden";
    }, 1400);
  };

  // 이미지/외부 지도 로딩이 늦어져도 인트로에 갇히지 않도록 강제 fallback
  window.setTimeout(hideLoader, 1700);
  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 250);
  }, { once: true });


  /* ---------------------------------------------------------
     02. HERO TITLE
     --------------------------------------------------------- */
  const heroTitle = $(".split-hero");

  if (heroTitle && !heroTitle.querySelector(".char")) {
    const label = heroTitle.getAttribute("aria-label") || heroTitle.textContent.trim();
    heroTitle.textContent = "";

    [...label].forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.transition =
        `opacity .75s cubic-bezier(.2,.7,.1,1) ${0.58 + index * 0.045}s, ` +
        `transform .85s cubic-bezier(.2,.7,.1,1) ${0.58 + index * 0.045}s`;
      heroTitle.appendChild(span);
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        $$(".char", heroTitle).forEach((char) => {
          char.style.opacity = "1";
          char.style.transform = "translateY(0) rotate(0deg)";
        });
      });
    });
  }


  /* ---------------------------------------------------------
     03. REVEAL LINES
     <br> 단위의 제목을 CSS가 기대하는 .line > span 구조로 변환
     --------------------------------------------------------- */
  $$(".reveal-lines").forEach((element) => {
    if (element.querySelector(".line")) return;

    const parts = element.innerHTML
      .split(/<br\s*\/?>/gi)
      .map((part) => part.trim())
      .filter(Boolean);

    if (!parts.length) return;

    element.innerHTML = parts
      .map((part) => `<span class="line"><span>${part}</span></span>`)
      .join("");
  });


  /* ---------------------------------------------------------
     04. SCROLL REVEAL / IMAGE REVEAL
     --------------------------------------------------------- */
  const revealTargets = $$(".reveal, .image-reveal, .reveal-lines");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -5% 0px"
    });

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }


  /* ---------------------------------------------------------
     05. MOBILE MENU
     --------------------------------------------------------- */
  const menuToggle = $(".menu-toggle");
  const mobileMenu = $(".mobile-menu");

  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    mobileMenu?.classList.toggle("is-open", open);

    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    mobileMenu?.setAttribute("aria-hidden", String(!open));
  };

  menuToggle?.addEventListener("click", () => {
    setMenu(!document.body.classList.contains("menu-open"));
  });

  $$(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });


  /* ---------------------------------------------------------
     06. MOBILE HERO CTA
     스크롤 시 타이틀과 겹치지 않도록 숨김
     --------------------------------------------------------- */
  const heroCta = $(".hero__cta");
  let heroCtaTicking = false;

  const updateHeroCta = () => {
    heroCtaTicking = false;
    if (!heroCta) return;
    const shouldHide = mobileMq.matches && window.scrollY > 80;
    heroCta.classList.toggle("is-hidden", shouldHide);
  };

  const requestHeroCtaUpdate = () => {
    if (heroCtaTicking) return;
    heroCtaTicking = true;
    requestAnimationFrame(updateHeroCta);
  };

  updateHeroCta();
  window.addEventListener("scroll", requestHeroCtaUpdate, { passive: true });
  window.addEventListener("resize", requestHeroCtaUpdate, { passive: true });


  /* ---------------------------------------------------------
     07. PARALLAX
     data-parallax가 있는 컨테이너만 이동.
     hero 이미지 자체의 slow zoom animation과 충돌하지 않음.
     --------------------------------------------------------- */
  const parallaxItems = $$("[data-parallax]");
  let parallaxTicking = false;
  let parallaxEnabled = !mobileMq.matches && finePointerMq.matches;

  const clearParallax = () => {
    parallaxItems.forEach((item) => {
      item.style.transform = "";
      item.style.willChange = "";
    });
  };

  const updateParallax = () => {
    parallaxTicking = false;
    if (!parallaxEnabled) return;

    const viewportHeight = window.innerHeight;

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -160 || rect.top > viewportHeight + 160) return;

      const speed = Number(item.dataset.parallax || 0);
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      const translateY = centerOffset * -speed;

      item.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
    });
  };

  const requestParallax = () => {
    if (!parallaxEnabled || parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(updateParallax);
  };

  const syncParallaxMode = () => {
    const nextEnabled = !mobileMq.matches && finePointerMq.matches;
    if (nextEnabled === parallaxEnabled) return;

    parallaxEnabled = nextEnabled;

    if (parallaxEnabled) {
      parallaxItems.forEach((item) => {
        item.style.willChange = "transform";
      });
      updateParallax();
    } else {
      clearParallax();
    }
  };

  if (parallaxItems.length) {
    if (parallaxEnabled) {
      parallaxItems.forEach((item) => {
        item.style.willChange = "transform";
      });
      updateParallax();
    }

    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", () => {
      syncParallaxMode();
      requestParallax();
    }, { passive: true });
  }


  /* ---------------------------------------------------------
     08. CUSTOM CURSOR
     --------------------------------------------------------- */
  const cursor = $(".cursor");
  const follower = $(".cursor-follower");
  const finePointer = finePointerMq.matches;

  if (finePointer && cursor && follower) {
    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;

    window.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    }, { passive: true });

    const animateFollower = () => {
      followerX += (mouseX - followerX) * 0.16;
      followerY += (mouseY - followerY) * 0.16;
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;
      requestAnimationFrame(animateFollower);
    };

    animateFollower();

    $$("a, button").forEach((element) => {
      element.addEventListener("mouseenter", () => document.body.classList.add("is-link"));
      element.addEventListener("mouseleave", () => document.body.classList.remove("is-link"));
    });
  }


  /* ---------------------------------------------------------
     09. MAGNETIC BUTTON
     데스크톱에서만 아주 약하게.
     --------------------------------------------------------- */
  if (finePointer) {
    $$(".magnetic").forEach((element) => {
      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`;
      });

      element.addEventListener("mouseleave", () => {
        element.style.transform = "";
      });
    });
  }


  /* ---------------------------------------------------------
     10. ANCHOR SAFETY
     href="#"인 임시 링크가 페이지 맨 위로 튀는 것만 방지
     --------------------------------------------------------- */
  $$('a[href="#"]').forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

})();
/* ===== PHONE COPY ===== */
document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".contact__copy-phone");

  if (!button) return;

  button.addEventListener("click", async () => {
    const phone = button.dataset.phone || "01033622557";
    const copyLabel = button.querySelector(".copy-icon");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(phone);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = phone;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        document.execCommand("copy");
        textarea.remove();
      }

      if (copyLabel) {
        const original = copyLabel.textContent;
        copyLabel.textContent = "COPIED";

        setTimeout(() => {
          copyLabel.textContent = original;
        }, 1500);
      }
    } catch (error) {
      console.error("전화번호 복사 실패:", error);
    }
  });
});

/* ===== ARTIST RELEASE AUDIO ===== */
document.addEventListener("DOMContentLoaded", () => {
  const player = document.getElementById("artistAudioPlayer");
  const releases = Array.from(document.querySelectorAll(".artist-release[data-audio]"));

  if (!player || !releases.length) return;

  let activeRelease = null;
  let progressFrame = null;

  const absoluteUrl = (src) => new URL(src, window.location.href).href;

  const setVisualState = (button, state = "idle") => {
    const control = button.querySelector(".artist-release__control");
    const label = button.querySelector(".artist-release__state");
    const track = button.dataset.track || "음원";

    button.classList.toggle("is-playing", state === "playing");
    button.classList.toggle("is-paused", state === "paused");
    button.setAttribute("aria-pressed", String(state === "playing"));

    if (state === "playing") {
      if (control) control.textContent = "Ⅱ";
      if (label) label.textContent = "PLAYING";
      button.setAttribute("aria-label", `${track} 일시정지`);
    } else if (state === "paused") {
      if (control) control.textContent = "▶";
      if (label) label.textContent = "PAUSED";
      button.setAttribute("aria-label", `${track} 계속 재생`);
    } else {
      if (control) control.textContent = "▶";
      if (label) label.textContent = "PLAY";
      button.setAttribute("aria-label", `${track} 재생`);
      button.querySelector(".artist-release__cover")?.style.setProperty("--progress", "0%");
    }
  };

  const resetOthers = (except = null) => {
    releases.forEach((button) => {
      if (button !== except) setVisualState(button, "idle");
    });
  };

  const stopProgressLoop = () => {
    if (progressFrame) cancelAnimationFrame(progressFrame);
    progressFrame = null;
  };

  const updateProgress = () => {
    if (!activeRelease || player.paused) {
      stopProgressLoop();
      return;
    }

    const cover = activeRelease.querySelector(".artist-release__cover");
    const progress = player.duration && Number.isFinite(player.duration)
      ? Math.min(100, (player.currentTime / player.duration) * 100)
      : 0;

    cover?.style.setProperty("--progress", `${progress}%`);
    progressFrame = requestAnimationFrame(updateProgress);
  };

  releases.forEach((button) => {
    button.addEventListener("click", async () => {
      const src = button.dataset.audio;
      if (!src) return;

      const nextSrc = absoluteUrl(src);
      const isSameTrack = player.src === nextSrc;

      try {
        if (activeRelease === button && isSameTrack && !player.paused) {
          player.pause();
          return;
        }

        if (!isSameTrack) {
          player.src = src;
          player.load();
          if (activeRelease && activeRelease !== button) {
            setVisualState(activeRelease, "idle");
          }
        }

        activeRelease = button;
        resetOthers(button);
        await player.play();
      } catch (error) {
        console.error("음원 재생 실패:", error);
        setVisualState(button, "idle");
      }
    });
  });

  player.addEventListener("play", () => {
    if (!activeRelease) return;
    setVisualState(activeRelease, "playing");
    stopProgressLoop();
    progressFrame = requestAnimationFrame(updateProgress);
  });

  player.addEventListener("pause", () => {
    stopProgressLoop();
    if (!activeRelease || player.ended) return;
    setVisualState(activeRelease, "paused");
  });

  player.addEventListener("ended", () => {
    stopProgressLoop();
    if (activeRelease) setVisualState(activeRelease, "idle");
    activeRelease = null;
    player.currentTime = 0;
  });

  player.addEventListener("error", () => {
    stopProgressLoop();
    if (activeRelease) setVisualState(activeRelease, "idle");
  });
});
/* ===== /ARTIST RELEASE AUDIO ===== */

