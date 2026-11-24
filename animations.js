(() => {
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // Flag so fallback scroll handler in script.js yields to GSAP ScrollTrigger
  window.__AHMA_GSAP_INTRO__ = true;

  // =========================================================================
  // 0. Lenis Smooth Scroll synced to GSAP ticker + ScrollTrigger
  // =========================================================================
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    document.documentElement.classList.add('lenis');
    lenis = new window.Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Pause Lenis whenever body overflow is locked (menu drawer / lightbox)
    const bodyObserver = new MutationObserver(() => {
      if (document.body.style.overflow === 'hidden') {
        lenis.stop();
      } else {
        lenis.start();
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  }

  // =========================================================================
  // 1. Scroll-driven Hero -> Sky Intro (pure GPU transforms, zero reflow)
  // =========================================================================
  const scrollTrack = document.getElementById('intro-scroll-track');
  const stickyStage = document.getElementById('intro-sticky');
  const heroMorph = document.getElementById('hero-morph');
  const heroMorphImg = heroMorph?.querySelector('.hero-morph__image');
  const heroVignette = document.getElementById('hero-morph-vignette');
  const thumbSlot = document.getElementById('intro-thumb-slot');
  const introHeadline = document.getElementById('intro-headline');
  const scrollHint = document.getElementById('hero-scroll-hint');
  const header = document.getElementById('site-header');

  if (scrollTrack && stickyStage && heroMorph && thumbSlot) {
    if (scrollHint) {
      gsap.to(scrollHint.querySelector('.hero-scroll-hint__line'), {
        scaleY: 0.5,
        transformOrigin: 'top center',
        repeat: -1,
        yoyo: true,
        duration: 1.25,
        ease: 'sine.inOut'
      });
    }

    const getTargetMetrics = () => {
      const stickyRect = stickyStage.getBoundingClientRect();
      const slotRect = thumbSlot.getBoundingClientRect();
      const sw = Math.max(stickyRect.width, 1);
      const sh = Math.max(stickyRect.height, 1);
      const sx = slotRect.width / sw;
      const sy = slotRect.height / sh;
      const maxS = Math.max(sx, sy);
      return {
        x: slotRect.left - stickyRect.left,
        y: slotRect.top - stickyRect.top,
        sx,
        sy,
        innerSx: (maxS / sx) * 1.08,
        innerSy: (maxS / sy) * 1.08
      };
    };

    const introTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollTrack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.55,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (!header) return;
          const p = self.progress;
          header.classList.toggle('is-dark-ink', p > 0.16);
          header.classList.toggle('is-scrolled', p >= 0.98);
        }
      }
    });

    introTl.fromTo(
      heroMorph,
      { x: 0, y: 0, scaleX: 1, scaleY: 1, force3D: true },
      {
        x: () => getTargetMetrics().x,
        y: () => getTargetMetrics().y,
        scaleX: () => getTargetMetrics().sx,
        scaleY: () => getTargetMetrics().sy,
        force3D: true,
        ease: 'power2.inOut',
        duration: 0.62
      },
      0
    );

    if (heroMorphImg) {
      introTl.fromTo(
        heroMorphImg,
        { scaleX: 1, scaleY: 1, force3D: true },
        {
          scaleX: () => getTargetMetrics().innerSx,
          scaleY: () => getTargetMetrics().innerSy,
          force3D: true,
          ease: 'power2.inOut',
          duration: 0.62
        },
        0
      );
    }

    if (heroVignette) {
      introTl.to(heroVignette, { opacity: 0.45, duration: 0.62, ease: 'none' }, 0);
    }

    if (scrollHint) {
      introTl.to(scrollHint, { opacity: 0, y: 12, duration: 0.14, ease: 'power1.out' }, 0);
    }

    if (introHeadline) {
      gsap.set(introHeadline, { filter: 'none' });
      introTl.fromTo(
        introHeadline,
        { opacity: 0, y: 26, force3D: true },
        { opacity: 1, y: 0, force3D: true, duration: 0.28, ease: 'power2.out' },
        0.44
      );
    }

    introTl.to({}, { duration: 0.38 }, 0.62);

    ScrollTrigger.create({
      trigger: scrollTrack,
      start: 'bottom 80px',
      onEnter: () => {
        header?.classList.add('is-scrolled', 'is-dark-ink');
        if (heroMorphImg && typeof heroMorphImg.pause === 'function') heroMorphImg.pause();
      },
      onLeaveBack: () => {
        header?.classList.remove('is-scrolled');
        if (heroMorphImg && typeof heroMorphImg.play === 'function') heroMorphImg.play().catch(() => {});
      }
    });
  }

  // Twilight house smooth scrubbed zoom-out
  const introHouse = document.querySelector('.intro__house');
  const introHouseImg = document.querySelector('.intro__house-img');
  if (introHouse && introHouseImg) {
    gsap.fromTo(
      introHouseImg,
      { scale: 1.07, yPercent: -2, force3D: true },
      {
        scale: 1,
        yPercent: 2,
        force3D: true,
        ease: 'none',
        scrollTrigger: {
          trigger: introHouse,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        }
      }
    );
  }

  // =========================================================================
  // 2. Inner Page Entrance Animations (text only, zero image flash)
  // =========================================================================
  const pageEntranceTargets = document.querySelectorAll(
    '.editorial-hero .section-eyebrow, .editorial-hero .display-xl, .editorial-hero .lead-copy, .page-title-block h1, .projects-page__filters'
  );
  if (pageEntranceTargets.length) {
    gsap.from(pageEntranceTargets, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      stagger: 0.09,
      ease: 'power3.out',
      force3D: true
    });
  }

  // =========================================================================
  // 3. Zero-Flicker Subtle Scrubbed Parallax on Architectural Photography
  //    (images stay opacity: 1 at all times so peeking edges never blink)
  // =========================================================================
  const parallaxFrames = document.querySelectorAll(
    '.project-wide, .method__visual, .projects-feed__card--wide, .case-gallery__wide, .bureau-gallery__wide'
  );
  parallaxFrames.forEach((frame) => {
    const img = frame.querySelector('img');
    if (!img || img.classList.contains('project-detail__sculpt-img')) return;
    gsap.fromTo(
      img,
      { scale: 1.05, yPercent: -2.5, force3D: true },
      {
        scale: 1.01,
        yPercent: 2.5,
        force3D: true,
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        }
      }
    );
  });

  // =========================================================================
  // 4. Staggered Editorial Text, Lists & Principles
  // =========================================================================
  const animateStaggerGroup = (containerSelector, childSelector, opts = {}) => {
    document.querySelectorAll(containerSelector).forEach((container) => {
      const items = container.querySelectorAll(childSelector);
      if (!items.length) return;
      gsap.from(items, {
        y: opts.y ?? 22,
        opacity: 0,
        duration: opts.duration ?? 0.8,
        stagger: opts.stagger ?? 0.08,
        ease: 'power3.out',
        force3D: true,
        scrollTrigger: {
          trigger: container,
          start: opts.start ?? 'top 88%',
          once: true
        }
      });
    });
  };

  animateStaggerGroup('.founders__text', '.founders__quote, .founders__author', { y: 26, stagger: 0.12 });
  animateStaggerGroup('.credentials__column', '.section-eyebrow, .lined-list__item', { y: 18, stagger: 0.07 });
  animateStaggerGroup('.method__header', '.method__heading-col, .method__desc-col', { y: 24, stagger: 0.12 });
  animateStaggerGroup('.method__cards', '.method__card', { y: 24, stagger: 0.08 });
  animateStaggerGroup('.contact', '.contact__eyebrow-col, .contact__title, .contact-form__field, .contact-form__consent, .contact-form__actions, .contact-links__row', {
    y: 18,
    stagger: 0.05
  });
  animateStaggerGroup('.method-principles', '.method-principle', { y: 26, stagger: 0.09 });
  animateStaggerGroup('.bureau-quote__box', '.bureau-quote__mark, .display-md, .bureau-quote__author', { y: 24, stagger: 0.1 });
  animateStaggerGroup('.bureau-geo__info', '.bureau-geo__head, .bureau-geo__sub, .bureau-geo__item', { y: 18, stagger: 0.07 });
  animateStaggerGroup('.media-news-list', '.media-news-item', { y: 20, stagger: 0.08 });
  animateStaggerGroup('.case-overview', '.display-heading, .case-specs__row, .case-concept', { y: 20, stagger: 0.07 });
  animateStaggerGroup('.ahmadom-section', '.ahmadom-block', { y: 22, stagger: 0.1 });

  // =========================================================================
  // 5. Left Menu Drawer Stagger Micro-animation
  // =========================================================================
  const menuToggle = document.getElementById('menu-toggle');
  const navDrawer = document.getElementById('nav-drawer');
  if (menuToggle && navDrawer) {
    menuToggle.addEventListener('click', () => {
      if (navDrawer.classList.contains('is-open')) {
        const links = navDrawer.querySelectorAll('.nav-drawer__links li, .nav-drawer__footer');
        gsap.fromTo(
          links,
          { x: -20, opacity: 0, force3D: true },
          { x: 0, opacity: 1, force3D: true, duration: 0.5, stagger: 0.05, delay: 0.1, ease: 'power3.out', overwrite: true }
        );
      }
    });
  }

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
})();
