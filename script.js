(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // ---------------------------------------------------------
  // Loader + hero intro
  // ---------------------------------------------------------
  window.addEventListener("load", () => {
    setTimeout(() => $(".page-loader")?.classList.add("is-hidden"), 350);
    animateHeroTitle();
  });

  function animateHeroTitle() {
    const title = $(".split-hero");
    if (!title) return;
    const text = title.textContent.trim();
    title.textContent = "";
    [...text].forEach((char, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = char;
      span.style.transition = `opacity .7s cubic-bezier(.2,.7,.1,1) ${0.45 + i * 0.045}s,
                               transform 1s cubic-bezier(.2,.7,.1,1) ${0.45 + i * 0.045}s`;
      title.appendChild(span);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          span.style.opacity = "1";
          span.style.transform = "translateY(0) rotate(0)";
        });
      });
    });
  }

  // ---------------------------------------------------------
  // Split reveal line headings
  // ---------------------------------------------------------
  $$(".reveal-lines").forEach(el => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i).map(x => x.trim()).filter(Boolean);
    el.innerHTML = lines.map((line, i) =>
      `<span class="line"><span style="transition-delay:${i * 0.09}s">${line}</span></span>`
    ).join("");
  });

  // ---------------------------------------------------------
  // Intersection reveals
  // ---------------------------------------------------------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });

  $$(".reveal, .reveal-lines, .image-reveal").forEach(el => revealObserver.observe(el));

  // ---------------------------------------------------------
  // Header theme observer
  // ---------------------------------------------------------
  const header = $("[data-header]");
  const themeSections = $$("[data-header-theme]");
  const themeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && header) {
        header.dataset.theme = entry.target.dataset.headerTheme;
      }
    });
  }, { threshold: 0, rootMargin: "-42% 0px -52% 0px" });
  themeSections.forEach(s => themeObserver.observe(s));

  // ---------------------------------------------------------
  // Native smooth-ish parallax & hero typography movement
  // ---------------------------------------------------------
  const parallaxEls = $$("[data-parallax]");
  const horizontal = $("[data-horizontal]");
  const heroTitle = $(".hero__title");
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;

        parallaxEls.forEach(el => {
          const rect = el.parentElement.getBoundingClientRect();
          const speed = parseFloat(el.dataset.parallax || "0.05");
          const centerDelta = (window.innerHeight / 2 - (rect.top + rect.height / 2));
          el.style.transform = `translate3d(0, ${centerDelta * speed}px, 0) scale(1.04)`;
        });

        if (heroTitle && y < window.innerHeight * 1.2) {
          const p = Math.min(y / window.innerHeight, 1);
          heroTitle.style.transform = `translate3d(0, ${-p * 110}px, 0) scale(${1 - p * .05})`;
          heroTitle.style.opacity = String(1 - p * .5);
        }

        if (horizontal) {
          const r = horizontal.parentElement.getBoundingClientRect();
          const progress = (window.innerHeight - r.top) / (window.innerHeight + r.height);
          const x = (progress - .5) * -20;
          horizontal.style.transform = `translateX(${x}vw)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------------------------------------------------
  // Mobile menu
  // ---------------------------------------------------------
  const toggle = $(".menu-toggle");
  const mobileMenu = $(".mobile-menu");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    mobileMenu?.classList.remove("is-open");
    mobileMenu?.setAttribute("aria-hidden", "true");
    toggle?.setAttribute("aria-expanded", "false");
  }
  toggle?.addEventListener("click", () => {
    const open = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    mobileMenu?.classList.toggle("is-open", open);
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    toggle?.setAttribute("aria-expanded", String(open));
  });
  $$(".mobile-menu a").forEach(a => a.addEventListener("click", closeMenu));

  // ---------------------------------------------------------
  // Magnetic CTA
  // ---------------------------------------------------------
  $$(".magnetic").forEach(el => {
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * .06}px, ${y * .08}px)`;
    });
    el.addEventListener("mouseleave", () => el.style.transform = "");
  });

  // ---------------------------------------------------------
  // Desktop custom cursor
  // ---------------------------------------------------------
  const cursor = $(".cursor");
  const follower = $(".cursor-follower");
  if (cursor && follower && matchMedia("(pointer:fine)").matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, fx = mx, fy = my;
    document.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    const follow = () => {
      fx += (mx - fx) * .14;
      fy += (my - fy) * .14;
      follower.style.transform = `translate(${fx}px,${fy}px) translate(-50%,-50%)`;
      requestAnimationFrame(follow);
    };
    follow();
    $$("a, button").forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("is-link"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("is-link"));
    });
  }

  // ---------------------------------------------------------
  // Replace placeholders easily:
  // Add data-image="./assets/filename.jpg" to .media-placeholder
  // ---------------------------------------------------------
  $$(".media-placeholder[data-image]").forEach(el => {
    const src = el.dataset.image;
    if (!src) return;
    el.style.backgroundImage = `linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.08)), url("${src}")`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.querySelector(".media-placeholder__label")?.remove();
  });
})();
