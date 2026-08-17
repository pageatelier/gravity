(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

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

  const updateHeroCta = () => {
    if (!heroCta) return;
    const shouldHide = window.matchMedia("(max-width: 960px)").matches && window.scrollY > 80;
    heroCta.classList.toggle("is-hidden", shouldHide);
  };

  updateHeroCta();
  window.addEventListener("scroll", updateHeroCta, { passive: true });
  window.addEventListener("resize", updateHeroCta, { passive: true });


  /* ---------------------------------------------------------
     07. PARALLAX
     data-parallax가 있는 컨테이너만 이동.
     hero 이미지 자체의 slow zoom animation과 충돌하지 않음.
     --------------------------------------------------------- */
  const parallaxItems = $$("[data-parallax]");
  let parallaxTicking = false;

  const updateParallax = () => {
    const viewportHeight = window.innerHeight;

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > viewportHeight + 200) return;

      const speed = Number(item.dataset.parallax || 0);
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      const translateY = centerOffset * -speed;

      item.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
    });

    parallaxTicking = false;
  };

  const requestParallax = () => {
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(updateParallax);
  };

  if (parallaxItems.length) {
    updateParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
  }


  /* ---------------------------------------------------------
     08. CUSTOM CURSOR
     --------------------------------------------------------- */
  const cursor = $(".cursor");
  const follower = $(".cursor-follower");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
