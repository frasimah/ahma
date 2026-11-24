(() => {
  // 1. Header scroll border & dark-ink state
  const header = document.getElementById('site-header');
  const isHeroHeader = header && !header.classList.contains('site-header--solid');

  const onScroll = () => {
    if (!header) return;
    const scrolled = window.scrollY > (isHeroHeader ? Math.max(window.innerHeight * 0.45, 220) : 20);
    header.classList.toggle('is-scrolled', scrolled);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2. Left-sliding Navigation Drawer (Меню · слева)
  const menuToggle = document.getElementById('menu-toggle');
  const navDrawer = document.getElementById('nav-drawer');
  const closeDrawerTriggers = document.querySelectorAll('[data-close-drawer]');

  const setDrawerOpen = (open) => {
    if (!navDrawer || !menuToggle) return;
    navDrawer.classList.toggle('is-open', open);
    navDrawer.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  menuToggle?.addEventListener('click', () => {
    setDrawerOpen(!navDrawer?.classList.contains('is-open'));
  });
  closeDrawerTriggers.forEach((el) => el.addEventListener('click', () => setDrawerOpen(false)));

  // 3. Lightbox (counter + "Без затемнения" mode per 712:190)
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxNoDimToggle = document.getElementById('lightbox-no-dim-toggle');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let lightboxTriggers = [];
  let activeIndex = -1;

  const formatNum = (n) => String(n).padStart(2, '0');

  const applyNoDimMode = (enabled) => {
    if (!lightbox) return;
    lightbox.classList.toggle('is-no-dim', enabled);
    if (lightboxNoDimToggle) lightboxNoDimToggle.checked = enabled;
  };

  const showLightboxImage = (index) => {
    if (!lightboxTriggers.length || !lightboxImg || !lightboxCaption) return;
    activeIndex = (index + lightboxTriggers.length) % lightboxTriggers.length;
    const item = lightboxTriggers[activeIndex];
    lightboxImg.src = item.dataset.lightboxSrc || '';
    lightboxImg.alt = item.dataset.lightboxCaption || '';
    lightboxCaption.textContent = item.dataset.lightboxCaption || '';
    if (lightboxCounter) {
      lightboxCounter.textContent = `${formatNum(activeIndex + 1)} / ${formatNum(lightboxTriggers.length)}`;
    }
    applyNoDimMode(item.dataset.lightboxNoDim === 'true');
  };

  const openLightbox = (index) => {
    if (!lightbox) return;
    showLightboxImage(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const bindLightboxTriggers = () => {
    lightboxTriggers = Array.from(document.querySelectorAll('[data-lightbox-src]'));
    lightboxTriggers.forEach((trigger, index) => {
      trigger.onclick = () => openLightbox(index);
    });
  };

  lightboxNoDimToggle?.addEventListener('change', (e) => applyNoDimMode(e.target.checked));
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => showLightboxImage(activeIndex - 1));
  lightboxNext?.addEventListener('click', () => showLightboxImage(activeIndex + 1));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (navDrawer?.classList.contains('is-open')) setDrawerOpen(false);
      if (lightbox?.classList.contains('is-open')) closeLightbox();
    } else if (lightbox?.classList.contains('is-open')) {
      if (event.key === 'ArrowLeft') showLightboxImage(activeIndex - 1);
      if (event.key === 'ArrowRight') showLightboxImage(activeIndex + 1);
    }
  });

  // 4. Media page interactive news preview
  const newsItems = document.querySelectorAll('.media-news-item');
  const newsPreviewImg = document.getElementById('media-preview-img');
  if (newsItems.length && newsPreviewImg) {
    newsItems.forEach((item) => {
      const activate = () => {
        newsItems.forEach((el) => el.classList.toggle('is-active', el === item));
        const src = item.dataset.previewSrc;
        if (src) newsPreviewImg.src = src;
      };
      item.addEventListener('mouseenter', activate);
      item.addEventListener('click', activate);
    });
  }

  // 5. Projects Archive category filter (projects.html)
  const filterBtns = document.querySelectorAll('[data-projects-filter]');
  const feedCards = document.querySelectorAll('[data-project-cat]');
  if (filterBtns.length && feedCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.projectsFilter || 'all';
        filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        feedCards.forEach((card) => {
          const visible = filter === 'all' || card.dataset.projectCat === filter;
          card.classList.toggle('is-hidden', !visible);
        });
        document.querySelectorAll('.projects-feed__pair').forEach((pair) => {
          const anyVisible = Array.from(pair.children).some((c) => !c.classList.contains('is-hidden'));
          pair.classList.toggle('is-hidden', !anyVisible);
        });
      });
    });
  }

  // 6. Dynamic Project Case Study Renderer (project.html?id=...)
  const projectRoot = document.getElementById('project-page-root');
  if (projectRoot && Array.isArray(window.AHMA_PROJECTS)) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'bolshoe-ozero';
    const list = window.AHMA_PROJECTS;
    const idx = Math.max(list.findIndex((p) => p.id === id), 0);
    const project = list[idx];
    const nextProject = list[(idx + 1) % list.length];

    document.title = `${project.title} — АХМА`;

    const specsHtml = project.specs
      .map(
        (s) => `
        <div class="case-specs__row">
          <p>${s.label}</p>
          <p>${s.value}</p>
        </div>`
      )
      .join('');

    const conceptHtml = project.concept.map((p) => `<p>${p}</p>`).join('');

    const galleryHtml = project.gallery
      .map((row) => {
        if (row.type === 'pair') {
          const items = row.items
            .map(
              (img) => `
              <figure class="case-gallery__pair-item ${img.noDim ? 'case-gallery__plan-item' : ''}">
                <button
                  type="button"
                  class="project-trigger"
                  data-lightbox-src="${img.src}"
                  data-lightbox-caption="${project.title} · ${img.caption}"
                  ${img.noDim ? 'data-lightbox-no-dim="true"' : ''}
                  aria-label="Увеличить: ${img.caption}"
                >
                  <img src="${img.src}" alt="${img.caption}" loading="lazy" />
                </button>
              </figure>`
            )
            .join('');
          return `<div class="case-gallery__pair">${items}</div>`;
        }
        const img = row.items[0];
        return `
          <figure class="case-gallery__wide ${img.noDim ? 'case-gallery__plan-item' : ''}">
            <button
              type="button"
              class="project-trigger"
              data-lightbox-src="${img.src}"
              data-lightbox-caption="${project.title} · ${img.caption}"
              ${img.noDim ? 'data-lightbox-no-dim="true"' : ''}
              aria-label="Увеличить: ${img.caption}"
            >
              <img src="${img.src}" alt="${img.caption}" loading="lazy" />
            </button>
          </figure>`;
      })
      .join('');

    const videoHtml = project.video
      ? `
        <figure class="case-video">
          <video controls autoplay muted loop playsinline preload="metadata" poster="${project.hero}">
            <source src="${project.video}" type="video/mp4" />
          </video>
        </figure>`
      : '';

    projectRoot.innerHTML = `
      <section class="case-hero" aria-label="Обложка проекта">
        <button
          type="button"
          class="case-hero__btn"
          data-lightbox-src="${project.hero}"
          data-lightbox-caption="${project.title}"
          aria-label="Открыть обложку проекта: ${project.title}"
        >
          <img src="${project.hero}" alt="${project.title}" />
        </button>
        <div class="case-hero__vignette" aria-hidden="true"></div>
      </section>

      <section class="container">
        <div class="case-overview">
          <h1 class="display-heading">${project.title}</h1>
          <div class="case-specs">${specsHtml}</div>
          <div class="case-concept">
            <h2 class="display-sm">Концепция</h2>
            ${conceptHtml}
          </div>
        </div>

        <div class="case-gallery">${galleryHtml}${videoHtml}</div>

        <nav class="case-nav" aria-label="Навигация по проектам">
          <a href="projects.html">←&nbsp;&nbsp;Все проекты</a>
          <a href="project.html?id=${nextProject.id}">${nextProject.title}&nbsp;&nbsp;→</a>
        </nav>
      </section>
    `;
  }

  // 5b. Bureau globe city pins sync
  const geoCities = document.querySelectorAll('.bureau-geo__item[data-city], .bureau-geo__pin[data-city]');
  if (geoCities.length) {
    const setActiveCity = (city) => {
      geoCities.forEach((el) => el.classList.toggle('is-active', Boolean(city) && el.dataset.city === city));
    };
    geoCities.forEach((el) => {
      el.addEventListener('mouseenter', () => setActiveCity(el.dataset.city));
      el.addEventListener('mouseleave', () => setActiveCity(null));
      el.addEventListener('focus', () => setActiveCity(el.dataset.city));
      el.addEventListener('blur', () => setActiveCity(null));
    });
  }

  bindLightboxTriggers();
})();
