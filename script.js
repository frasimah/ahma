(() => {
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navDrawer = document.getElementById('nav-drawer');
  const closeDrawerTriggers = document.querySelectorAll('[data-close-drawer]');

  // =========================================================================
  // 1. Scroll-driven Intro (encore-resort.ru choreography:
  //    Phase 1: 0..0.62 full-bleed shrink & dock into sky inset + inner counter-scale
  //    Phase 2: 0.45..0.72 caption blur-fade reveal + 0.62..1.0 sticky hold
  //    Phase 3: twilight house subtle parallax zoom-out 1.08 -> 1.0 on enter)
  // =========================================================================
  const scrollTrack = document.getElementById('intro-scroll-track');
  const stickyStage = document.getElementById('intro-sticky');
  const heroMorph = document.getElementById('hero-morph');
  const heroMorphImg = heroMorph?.querySelector('.hero-morph__image');
  const heroVignette = document.getElementById('hero-morph-vignette');
  const thumbSlot = document.getElementById('intro-thumb-slot');
  const introHeadline = document.getElementById('intro-headline');
  const scrollHint = document.getElementById('hero-scroll-hint');
  const introHouse = document.querySelector('.intro__house');
  const introHouseImg = document.querySelector('.intro__house-img');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  let rafId = null;

  const updateIntroScroll = () => {
    rafId = null;
    if (window.__AHMA_GSAP_INTRO__) return;
    if (!scrollTrack || !stickyStage || !heroMorph || !thumbSlot || prefersReducedMotion) {
      if (header) {
        header.classList.toggle('is-scrolled', window.scrollY > 220);
      }
      return;
    }

    const trackRect = scrollTrack.getBoundingClientRect();
    const stickyRect = stickyStage.getBoundingClientRect();
    const maxScroll = Math.max(trackRect.height - stickyRect.height, 1);
    const rawProgress = clamp(-trackRect.top / maxScroll, 0, 1);

    // Phase 1: shrink & dock (0 -> 0.62), then hold pinned (0.62 -> 1.0)
    const morphProgress = easeOutCubic(clamp(rawProgress / 0.62, 0, 1));

    const slotRect = thumbSlot.getBoundingClientRect();
    const targetLeft = slotRect.left - stickyRect.left;
    const targetTop = slotRect.top - stickyRect.top;
    const targetWidth = slotRect.width;
    const targetHeight = slotRect.height;

    const currentLeft = targetLeft * morphProgress;
    const currentTop = targetTop * morphProgress;
    const currentWidth = stickyRect.width + (targetWidth - stickyRect.width) * morphProgress;
    const currentHeight = stickyRect.height + (targetHeight - stickyRect.height) * morphProgress;

    heroMorph.style.transform = `translate3d(${currentLeft}px, ${currentTop}px, 0)`;
    heroMorph.style.width = `${currentWidth}px`;
    heroMorph.style.height = `${currentHeight}px`;

    // Counter-scale inner media slightly as container shrinks (like encore-resort --inner-scale)
    if (heroMorphImg) {
      const innerScale = 1 + 0.16 * morphProgress;
      heroMorphImg.style.transform = `scale(${innerScale.toFixed(4)})`;
    }

    if (heroVignette) {
      heroVignette.style.opacity = String(1 - morphProgress * 0.55);
    }

    // Phase 2: sky caption reveal right before dock completes
    if (introHeadline) {
      const textProgress = easeOutCubic(clamp((rawProgress - 0.44) / 0.28, 0, 1));
      introHeadline.style.opacity = String(textProgress);
      introHeadline.style.filter = `blur(${((1 - textProgress) * 10).toFixed(2)}px)`;
      introHeadline.style.transform = `translateY(${((1 - textProgress) * 24).toFixed(2)}px)`;
    }

    if (scrollHint) {
      scrollHint.style.opacity = String(clamp(1 - rawProgress * 7, 0, 1));
    }

    // Phase 3: subtle parallax zoom-out on twilight house as it rises into viewport
    if (introHouse && introHouseImg) {
      const houseRect = introHouse.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const enterProgress = clamp((vh - houseRect.top) / (vh + houseRect.height * 0.35), 0, 1);
      const houseScale = 1.08 - 0.08 * easeOutCubic(enterProgress);
      introHouseImg.style.transform = `scale(${houseScale.toFixed(4)})`;
    }

    if (header) {
      const pastHero = rawProgress > 0.18;
      const pastIntroTrack = trackRect.bottom <= 80;
      header.classList.toggle('is-dark-ink', pastHero);
      header.classList.toggle('is-scrolled', pastIntroTrack);
    }
  };

  const requestIntroUpdate = () => {
    if (rafId === null) {
      rafId = window.requestAnimationFrame(updateIntroScroll);
    }
  };

  window.addEventListener('scroll', requestIntroUpdate, { passive: true });
  window.addEventListener('resize', requestIntroUpdate, { passive: true });
  updateIntroScroll();

  // =========================================================================
  // 2. Left-sliding Navigation Drawer (Меню · слева)
  // =========================================================================
  const setDrawerOpen = (open) => {
    if (!navDrawer || !menuToggle) return;
    navDrawer.classList.toggle('is-open', open);
    navDrawer.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  menuToggle?.addEventListener('click', () => {
    const isOpen = navDrawer?.classList.contains('is-open');
    setDrawerOpen(!isOpen);
  });

  closeDrawerTriggers.forEach((el) => {
    el.addEventListener('click', () => setDrawerOpen(false));
  });

  // =========================================================================
  // 3. 5 Projects Archive & Case Study Modal (exact copy from Google Doc)
  // =========================================================================
  const PROJECTS = {
    'bolshoe-ozero': {
      title: 'Резиденция у Большого Озера',
      categoryLabel: 'Виллы и дома',
      image: 'assets/project-karelian.png',
      location: 'Россия, Ленинградская область, Большое озеро',
      area: '1753 м²',
      scope: 'эскизный проект, архитектурные решения, конструктивные решения',
      concept: [
        'Загородная резиденция спроектирована как современное родовое поместье, где комфортно соберутся все поколения семьи. Сложный рельеф участка с сильным уклоном превратился в главное достоинство проекта: архитектура здания позволила раскрыть панорамный вид на воду и живописный остров из окон всех ключевых комнат.',
        'Композиционным ориентиром проекта стал окружающий пейзаж — панорама озера и острова.',
        '---',
        'Полная инженерная автономность гарантирует семье абсолютную независимость и безопасность. А благодаря заложенному в проект потенциалу для трансформации, планировка идеально подстроена под текущий образ жизни и легко адаптируется под будущие сценарии и расширение семьи.'
      ]
    },
    'eco-hotel-karelia': {
      title: 'Эко-отель 4 звезды в Карелии',
      categoryLabel: 'Общественная функция',
      image: 'assets/intro-house.png',
      location: 'Россия, Карелия',
      area: null,
      scope: 'эскизное проектирование, концепт',
      concept: [
        'Проект четырехзвездочного эко-отеля задуман как готовое и гибкое решение для создания современных курортов в самых живописных уголках планеты. В основе комплекса лежит детально проработанная модульная линейка гостевых домов разной площади, для которой заранее выполнены все необходимые проектные разделы, что гарантирует легкую адаптацию, быстрый монтаж и надежность в любых климатических условиях.',
        '---',
        'Для Карелии гостевые дома на сваях стали естественным продолжением скалистого рельефа Ладожских шхер. Масштабное панорамное остекление наполняет интерьеры естественным светом и буквально впускает хвойный лес внутрь комнат. Террасы и внутренние пространства полностью ориентированы на завораживающие пейзажи, а лаконичные фасады из фиброцемента, термодерева и темного металла подчеркивают бережную интеграцию современной архитектуры в дикую природу.'
      ]
    },
    'iceberg-crimea': {
      title: 'Дом-айсберг в Крыму',
      categoryLabel: 'Виллы и дома',
      image: 'assets/project-facade.png',
      location: 'Россия, Крым',
      area: null,
      scope: 'эскизный проект, рабочая документация',
      concept: [
        'Резиденция спроектирована как монументальный «дом-айсберг», эффектно контрастирующий с густым массивом темно-зеленого леса. Строгая геометрия здания идеально вписана в ровный рельеф участка с перспективой будущего рекреационного благоустройства.',
        'Архитектура подчинена движению южного солнца: технический блок скрыт, а жилые зоны полностью раскрыты панорамным остеклением навстречу природе. Композиционным ядром стала гостиная с высотой потолков около пяти метров, к которой примыкают блок мастер-спален и СПА-комплекс.',
        '---',
        'Благодаря стеклянной стене-трансформеру пространство отдыха мгновенно объединяется с окружающим миром. Каждый квадратный метр функционален: транзитные холлы превращены в арт-пространства со световыми проемами, «прокалывающими» стены и впускающими лес внутрь дома. Лаконичный фасад из натурального камня раскрывается в сложной игре гладких, ребристых и «скалистых» фактур. В сочетании со скрытой архитектурной подсветкой это создает динамичный и неподвластный времени образ.'
      ]
    },
    'nahimovskoe': {
      title: 'Клубный поселок на озере Нахимовское',
      categoryLabel: 'Виллы и дома',
      image: 'assets/method-house.png',
      location: 'Россия, Ленинградская область, Карельский перешеек',
      area: 'площадь квартала: 1.6 га, площадь 8 участков 13 500 м², площадь зданий 3300 м²',
      scope: 'эскизный проект',
      concept: [
        'Закрытый клубный поселок на берегу озера Нахимовское представляет собой эксклюзивный инвестиционный продукт, гармонично вписанный в ландшафт хвойного леса. На обособленной территории площадью 1,63 га спроектирован камерный ансамбль из 8 приватных резиденций, объединенных строгим дизайн-кодом в стиле современного минимализма. Архитектурная концепция каскадом спускается к воде, открывая из панорамных окон прямой вид на водоем и природу Карельского перешейка.',
        '---',
        'Продуманный генплан сохраняет баланс между приватностью участков и общим благоустройством. Инфраструктура включает собственную береговую линию с пирсом для катеров и лодок. Лаконичные фасады из крупноформатного камня, натурального дерева и темного металла подчеркивают бескомпромиссный статус и безопасность загородной жизни.'
      ]
    },
    'indonesia-resort': {
      title: 'Курорт в Индонезии',
      categoryLabel: 'Общественная функция',
      image: 'assets/project-pool.png',
      location: 'Индонезия, остров Лабуан',
      area: null,
      scope: 'эскизный проект',
      concept: [
        'Масштабный курорт в Индонезии спроектирован как эффективный инвестиционный продукт, объединяющий отель и каскад приватных вилл. Продуманный генплан в Лабуане идеально использует сложный рельеф, утопающий в тропических джунглях. Каждая вилла интегрирована в склон и дополнена собственным инфинити-бассейном, панорамным остеклением и живой зеленой кровлей. Такое решение гарантирует абсолютную приватность и открывает завораживающие виды на экзотический ландшафт и вулкан.',
        '---',
        'Премиальная инфраструктура включает отельный блок, общественные бассейны и зоны отдыха. Архитектурная концепция выигрышно сочетает европейский минимализм и локальные традиции: монументальный бетон фасадов дополнен легкими бамбуковыми ширмами. Проект полностью готов к реализации и нацелен на круглогодичную высокорентабельную аренду.'
      ]
    }
  };

  // Smooth scroll from "Все проекты" button to archive
  const openArchiveBtn = document.getElementById('open-archive-btn');
  const archiveSection = document.getElementById('projects-archive');
  openArchiveBtn?.addEventListener('click', () => {
    archiveSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Archive category filtering
  const filterButtons = document.querySelectorAll('.archive__filter');
  const archiveCards = document.querySelectorAll('.archive-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter || 'all';
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      archiveCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  // Project Detail Modal
  const projectModal = document.getElementById('project-modal');
  const projectModalBody = document.getElementById('project-modal-body');
  const projectModalCategory = document.getElementById('project-modal-category');
  const closeProjectTriggers = document.querySelectorAll('[data-close-project]');

  const openProjectModal = (projectId) => {
    const project = PROJECTS[projectId];
    if (!project || !projectModal || !projectModalBody) return;

    if (projectModalCategory) projectModalCategory.textContent = project.categoryLabel;

    const specs = [
      { label: 'Локация', value: project.location },
      ...(project.area ? [{ label: 'Площадь', value: project.area }] : []),
      { label: 'Мы сделали', value: project.scope }
    ];

    const specsHtml = specs
      .map(
        (s) => `
        <div class="project-modal__spec-row">
          <span class="project-modal__spec-label">${s.label}</span>
          <span>${s.value}</span>
        </div>`
      )
      .join('');

    const conceptHtml = project.concept
      .map((item) => (item === '---' ? '<div class="project-modal__divider"></div>' : `<p>${item}</p>`))
      .join('');

    projectModalBody.innerHTML = `
      <h2 class="project-modal__title" id="project-modal-title">${project.title}</h2>
      <div class="project-modal__hero">
        <img src="${project.image}" alt="${project.title}" />
      </div>
      <div class="project-modal__specs">${specsHtml}</div>
      <div class="project-modal__concept">
        <p class="section-eyebrow">Концепция</p>
        ${conceptHtml}
      </div>
      <div>
        <a href="#contact" class="action-link" data-close-project-link>
          <span class="action-link__icon" aria-hidden="true">
            <img src="assets/arrow-icon.svg" alt="" width="18" height="18" />
          </span>
          <span>Обсудить похожий проект</span>
        </a>
      </div>
    `;

    projectModalBody.querySelector('[data-close-project-link]')?.addEventListener('click', () => {
      closeProjectModal();
    });

    projectModal.classList.add('is-open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    if (!projectModal) return;
    projectModal.classList.remove('is-open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-project-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.projectId;
      if (id) openProjectModal(id);
    });
  });

  closeProjectTriggers.forEach((el) => {
    el.addEventListener('click', closeProjectModal);
  });

  // =========================================================================
  // 4. Lightbox with counter & "Отображать без затемнения" mode (712:190)
  // =========================================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxNoDimToggle = document.getElementById('lightbox-no-dim-toggle');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const triggers = Array.from(document.querySelectorAll('[data-lightbox-src]'));

  let activeIndex = -1;

  const formatNum = (n) => String(n).padStart(2, '0');

  const applyNoDimMode = (enabled) => {
    if (!lightbox) return;
    lightbox.classList.toggle('is-no-dim', enabled);
    if (lightboxNoDimToggle) lightboxNoDimToggle.checked = enabled;
  };

  const showLightboxImage = (index) => {
    if (!triggers.length || !lightboxImg || !lightboxCaption) return;
    activeIndex = (index + triggers.length) % triggers.length;
    const item = triggers[activeIndex];
    lightboxImg.src = item.dataset.lightboxSrc || '';
    lightboxImg.alt = item.dataset.lightboxCaption || '';
    lightboxCaption.textContent = item.dataset.lightboxCaption || '';
    if (lightboxCounter) {
      lightboxCounter.textContent = `${formatNum(activeIndex + 1)} / ${formatNum(triggers.length)}`;
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

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => openLightbox(index));
  });

  lightboxNoDimToggle?.addEventListener('change', (e) => {
    applyNoDimMode(e.target.checked);
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => showLightboxImage(activeIndex - 1));
  lightboxNext?.addEventListener('click', () => showLightboxImage(activeIndex + 1));

  // Keyboard shortcuts
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (navDrawer?.classList.contains('is-open')) setDrawerOpen(false);
      if (projectModal?.classList.contains('is-open')) closeProjectModal();
      if (lightbox?.classList.contains('is-open')) closeLightbox();
    } else if (lightbox?.classList.contains('is-open')) {
      if (event.key === 'ArrowLeft') showLightboxImage(activeIndex - 1);
      if (event.key === 'ArrowRight') showLightboxImage(activeIndex + 1);
    }
  });

  // =========================================================================
  // 5. Contact Form validation
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!formStatus) return;

    const nameInput = contactForm.querySelector('input[name="name"]');
    const phoneInput = contactForm.querySelector('input[name="phone"]');
    const consentInput = contactForm.querySelector('input[name="consent"]');

    contactForm.querySelectorAll('.contact-form__field').forEach((field) => {
      field.classList.remove('is-invalid');
    });

    const missingName = !nameInput?.value.trim();
    const missingPhone = !phoneInput?.value.trim();
    const missingConsent = !consentInput?.checked;

    if (missingName) nameInput?.closest('.contact-form__field')?.classList.add('is-invalid');
    if (missingPhone) phoneInput?.closest('.contact-form__field')?.classList.add('is-invalid');

    if (missingName || missingPhone) {
      formStatus.textContent = 'Пожалуйста, укажите имя и номер телефона.';
      formStatus.classList.add('is-error');
      return;
    }

    if (missingConsent) {
      formStatus.textContent = 'Необходимо подтвердить согласие на обработку персональных данных.';
      formStatus.classList.add('is-error');
      return;
    }

    formStatus.classList.remove('is-error');
    formStatus.textContent = 'Спасибо! Заявка отправлена — мы свяжемся с вами в ближайшее время.';
    contactForm.reset();
  });
})();
