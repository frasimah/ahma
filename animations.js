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
  // 1. Scroll-driven Hero -> Sky Intro (encore-resort.ru with GSAP scrub inertia)
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
    // Initial gentle hero entrance settle
    if (heroMorphImg) {
      gsap.fromTo(
        heroMorphImg,
        { scale: 1.07 },
        { scale: 1, duration: 1.5, ease: 'power3.out', overwrite: 'auto' }
      );
    }

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
      return {
        x: slotRect.left - stickyRect.left,
        y: slotRect.top - stickyRect.top,
        width: slotRect.width,
        height: slotRect.height
      };
    };

    const introTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollTrack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.75,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (!header) return;
          const p = self.progress;
          header.classList.toggle('is-dark-ink', p > 0.16);
          header.classList.toggle('is-scrolled', p >= 0.98);
        }
      }
    });

    // Phase 1: Full-bleed hero smoothly shrinks & docks into sky inset (0 -> 0.62)
    introTl.fromTo(
      heroMorph,
      {
        x: 0,
        y: 0,
        width: () => stickyStage.getBoundingClientRect().width,
        height: () => stickyStage.getBoundingClientRect().height
      },
      {
        x: () => getTargetMetrics().x,
        y: () => getTargetMetrics().y,
        width: () => getTargetMetrics().width,
        height: () => getTargetMetrics().height,
        ease: 'power2.inOut',
        duration: 0.62
      },
      0
    );

    if (heroMorphImg) {
      introTl.to(
        heroMorphImg,
        {
          scale: 1.16,
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

    // Phase 2: Editorial sky headline reveals with blur-to-sharp right before dock finishes
    if (introHeadline) {
      introTl.fromTo(
        introHeadline,
        { opacity: 0, y: 28, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.28, ease: 'power2.out' },
        0.44
      );
    }

    // Phase 2b: Pinned sticky hold until progress = 1.0
    introTl.to({}, { duration: 0.38 }, 0.62);

    // Keep header scrolled state accurate past the intro track
    ScrollTrigger.create({
      trigger: scrollTrack,
      start: 'bottom 80px',
      onEnter: () => header?.classList.add('is-scrolled', 'is-dark-ink'),
      onLeaveBack: () => header?.classList.remove('is-scrolled')
    });
  }

  // Twilight house parallax zoom-out (encore-resort.ru Phase 3)
  const introHouse = document.querySelector('.intro__house');
  const introHouseImg = document.querySelector('.intro__house-img');
  if (introHouse && introHouseImg) {
    gsap.fromTo(
      introHouseImg,
      { scale: 1.1, yPercent: -3 },
      {
        scale: 1,
        yPercent: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: introHouse,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.9
        }
      }
    );
  }

  // =========================================================================
  // 2. Inner Page Entrance Animations (Hero / Editorial Title)
  // =========================================================================
  const caseHeroImg = document.querySelector('.case-hero img');
  if (caseHeroImg) {
    gsap.fromTo(
      caseHeroImg,
      { scale: 1.08 },
      { scale: 1, duration: 1.4, ease: 'power3.out' }
    );
  }

  const pageEntranceTargets = document.querySelectorAll(
    '.editorial-hero .section-eyebrow, .editorial-hero .display-xl, .editorial-hero .lead-copy, .page-title-block h1, .projects-page__filters'
  );
  if (pageEntranceTargets.length) {
    gsap.from(pageEntranceTargets, {
      y: 34,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'transform'
    });
  }

  // =========================================================================
  // 3. Architectural Image Curtain Reveals + Subtle Depth Parallax
  // =========================================================================
  const revealMediaSelectors = [
    '.project-wide',
    '.project-detail',
    '.project-asymmetric__right',
    '.method__visual',
    '.projects-feed__card',
    '.case-gallery__wide',
    '.case-gallery__pair-item',
    '.bureau-gallery__large',
    '.bureau-gallery__detail',
    '.bureau-gallery__wide',
    '.founders__portrait',
    '.media-card'
  ];

  document.querySelectorAll(revealMediaSelectors.join(', ')).forEach((frame) => {
    const img = frame.querySelector('img');
    const isSculptCrop = img?.classList.contains('project-detail__sculpt-img');

    gsap.fromTo(
      frame,
      { clipPath: 'inset(6% 0% 0% 0%)', opacity: 0 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        duration: 1.05,
        ease: 'power3.out',
        clearProps: 'clipPath',
        scrollTrigger: {
          trigger: frame,
          start: 'top 88%',
          once: true
        }
      }
    );

    if (img && !isSculptCrop) {
      gsap.fromTo(
        img,
        { scale: 1.08 },
        {
          scale: 1,
          duration: 1.35,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: frame,
            start: 'top 88%',
            once: true
          }
        }
      );
    }
  });

  // Subtle scrubbed vertical parallax on full-width architectural renders
  document.querySelectorAll('.project-wide img, .method__visual img, .case-gallery__wide img, .bureau-gallery__wide img').forEach((img) => {
    const parent = img.closest('figure');
    if (!parent) return;
    gsap.fromTo(
      img,
      { yPercent: -3 },
      {
        yPercent: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: parent,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      }
    );
  });

  // =========================================================================
  // 4. Staggered Editorial Text, Grids, Lists & Principles
  // =========================================================================
  const animateStaggerGroup = (containerSelector, childSelector, opts = {}) => {
    document.querySelectorAll(containerSelector).forEach((container) => {
      const items = container.querySelectorAll(childSelector);
      if (!items.length) return;
      gsap.from(items, {
        y: opts.y ?? 26,
        opacity: 0,
        duration: opts.duration ?? 0.85,
        stagger: opts.stagger ?? 0.09,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: container,
          start: opts.start ?? 'top 86%',
          once: true
        }
      });
    });
  };

  animateStaggerGroup('.founders__text', '.founders__quote, .founders__author', { y: 30, stagger: 0.14 });
  animateStaggerGroup('.credentials__column', '.section-eyebrow, .lined-list__item', { y: 20, stagger: 0.08 });
  animateStaggerGroup('.method__header', '.method__heading-col, .method__desc-col', { y: 28, stagger: 0.14 });
  animateStaggerGroup('.method__cards', '.method__card', { y: 28, stagger: 0.1 });
  animateStaggerGroup('.archive__grid', '.archive-card', { y: 30, stagger: 0.08 });
  animateStaggerGroup('.contact', '.contact__eyebrow-col, .contact__title, .contact-form__field, .contact-form__consent, .contact-form__actions, .contact-links__row', {
    y: 20,
    stagger: 0.06
  });
  animateStaggerGroup('.method-principles', '.method-principle', { y: 32, stagger: 0.11 });
  animateStaggerGroup('.bureau-quote__box', '.bureau-quote__mark, .display-md, .bureau-quote__author', { y: 28, stagger: 0.12 });
  animateStaggerGroup('.bureau-geo__info', '.bureau-geo__head, .bureau-geo__sub, .bureau-geo__item', { y: 22, stagger: 0.08 });
  animateStaggerGroup('.media-news-list', '.media-news-item', { y: 24, stagger: 0.1 });
  animateStaggerGroup('.case-overview', '.display-heading, .case-specs__row, .case-concept', { y: 24, stagger: 0.08 });
  animateStaggerGroup('.ahmadom-section', '.ahmadom-block', { y: 28, stagger: 0.12 });

  // Bureau 3D globe gentle scroll rotation/scale settle
  const globe = document.querySelector('.bureau-geo__globe');
  if (globe) {
    gsap.fromTo(
      globe,
      { scale: 0.92, rotation: -6 },
      {
        scale: 1,
        rotation: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: globe,
          start: 'top 90%',
          end: 'center center',
          scrub: 1
        }
      }
    );
  }

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
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.55, stagger: 0.055, delay: 0.12, ease: 'power3.out', overwrite: true }
        );
      }
    });
  }

  // Refresh ScrollTrigger once all images/fonts settle
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
})();
