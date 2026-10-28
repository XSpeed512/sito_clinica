/* ==========================================================================
   WIREFRAME CLINICA PRIVATA — SCRIPT.JS
   Vanilla JS, nessuna dipendenza esterna.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initStatsCounter();
  initTestimonialSlider();
  initDoctorModal();
  initPrivacyModal();
  initBackToTop();
  initCopyEmail();
  initCopyTelephone();
  initGmailCompose();
});

/* --------------------------------------------------------------------------
   1. HEADER — ombra allo scroll
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const toggleShadow = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  toggleShadow();
  window.addEventListener('scroll', toggleShadow, { passive: true });
}

/* --------------------------------------------------------------------------
   2. NAV MOBILE — apertura/chiusura menu hamburger
   -------------------------------------------------------------------------- */
function initMobileNav() {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const toggle = event.target.closest('#nav-toggle');
    const nav = document.getElementById('main-nav');
    if (toggle && nav) {
      const isOpen = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      return;
    }

    if (!event.target.closest('#main-nav a') || !nav) return;

    nav.classList.remove('is-open');
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* --------------------------------------------------------------------------
   3. STATISTICHE — conteggio animato al primo ingresso in viewport
   -------------------------------------------------------------------------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400; // ms
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easing "ease-out" per una decelerazione naturale
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('it-IT');

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('it-IT');
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  statNumbers.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   4. TESTIMONIANZE — slider statico con frecce, dots e swipe
   -------------------------------------------------------------------------- */
function initTestimonialSlider() {
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('prev-testimonial');
  const nextBtn = document.getElementById('next-testimonial');
  const dotsWrap = document.getElementById('testimonial-dots');
  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const slides = Array.from(track.children);
  let current = 0;

  // Costruzione dinamica dei dots in base al numero di slide
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Vai alla recensione ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Supporto swipe touch di base
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      goTo(current + (delta < 0 ? 1 : -1));
    }
  });

  goTo(0);
}

/* --------------------------------------------------------------------------
   5. MODALE PROFILO MEDICO — apertura/chiusura e popolamento dinamico
   -------------------------------------------------------------------------- */
function initDoctorModal() {
  const overlay = document.getElementById('doctor-modal-overlay');
  const closeBtn = document.getElementById('doctor-modal-close');
  const triggers = document.querySelectorAll('.doctor-profile-trigger');
  if (!overlay || !closeBtn || !triggers.length) return;

  const nameEl = document.getElementById('doctor-modal-name');
  const roleEl = document.getElementById('doctor-modal-role');
  const bioEl = document.getElementById('doctor-modal-bio');
  const tagsEl = document.getElementById('doctor-modal-tags');
  const phoneEl = document.getElementById('doctor-modal-phone');
  const emailEl = document.getElementById('doctor-modal-email');

  let lastFocusedTrigger = null;

  function openModal(trigger) {
    // Popola il modale con i dati (data-*) presi dal pulsante cliccato
    nameEl.textContent = trigger.dataset.name || 'Lorem Ipsum';
    roleEl.textContent = trigger.dataset.role || '';
    bioEl.textContent = trigger.dataset.bio || '';
    phoneEl.textContent = trigger.dataset.phone || '';
    emailEl.textContent = trigger.dataset.email || '';

    tagsEl.innerHTML = '';
    (trigger.dataset.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((tag) => {
        const span = document.createElement('span');
        span.textContent = tag;
        tagsEl.appendChild(span);
      });

    lastFocusedTrigger = trigger;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // blocca lo scroll dietro il modale
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedTrigger) lastFocusedTrigger.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openModal(trigger));
  });

  closeBtn.addEventListener('click', closeModal);

  // Chiude cliccando sull'overlay (fuori dal box) o con il tasto Esc
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });
}

/* --------------------------------------------------------------------------
   PRIVACY POLICY — apertura e chiusura del popup nel footer
   -------------------------------------------------------------------------- */
function initPrivacyModal() {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const dialog = document.getElementById('privacy-policy-modal');
    if (!(dialog instanceof HTMLDialogElement)) return;

    if (event.target.closest('#privacy-policy-open')) {
      dialog.showModal();
    } else if (event.target.closest('#privacy-policy-close')) {
      dialog.close();
    } else if (event.target === dialog) {
      dialog.close();
    }
  });
}

/* --------------------------------------------------------------------------
   6. BACK TO TOP — mostra/nasconde il pulsante in base allo scroll
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle('is-visible', window.scrollY > 480);
  };

  toggleVisibility();
  window.addEventListener('scroll', toggleVisibility, { passive: true });
}

/* --------------------------------------------------------------------------
   COPIA EMAIL NEGLI APPUNTI — icona accanto al contatto email
   -------------------------------------------------------------------------- */
function initCopyEmail() {
  const btn = document.getElementById('copy-email-btn');
  const emailText = document.getElementById('clinic-email-text');
  if (!btn || !emailText) return;
 
  btn.addEventListener('click', async () => {
    const value = emailText.textContent.trim();
 
    try {
      // Metodo moderno (richiede contesto sicuro: https o localhost)
      await navigator.clipboard.writeText(value);
    } catch (err) {
      // Fallback per browser più vecchi o contesti non sicuri
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackErr) {
        console.error('Copia negli appunti non riuscita:', fallbackErr);
      }
      document.body.removeChild(textarea);
    }
 
    // Feedback visivo: icona diventa spunta per ~1.5s
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✓';
    btn.classList.add('copied');
    btn.setAttribute('aria-label', 'Email copiata');
 
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('copied');
      btn.setAttribute('aria-label', 'Copia indirizzo email');
    }, 1600);
  });
}

function initCopyTelephone() {
  const btn = document.getElementById('copy-telephone-btn');
  const telText = document.getElementById('clinic-telephone-text');
  if (!btn || !telText) return;

  btn.addEventListener('click', async () => {
    const value = telText.textContent.trim();

    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackErr) {
        console.error('Copia negli appunti non riuscita:', fallbackErr);
      }
      document.body.removeChild(textarea);
    }

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✓';
    btn.classList.add('copied');
    btn.setAttribute('aria-label', 'Numero di telefono copiato');

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('copied');
      btn.setAttribute('aria-label', 'Copia numero di telefono');
    }, 1600);
  });
}

/* --------------------------------------------------------------------------
   EMAIL — apre Gmail con destinatario e messaggio precompilati
   -------------------------------------------------------------------------- */
function initGmailCompose() {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest('a[href^="mailto:"]');
    if (!link) return;

    const recipient = new URL(link.href).pathname;
    const composeUrl = new URL('https://mail.google.com/mail/');

    composeUrl.searchParams.set('view', 'cm');
    composeUrl.searchParams.set('fs', '1');
    composeUrl.searchParams.set('to', recipient);
    composeUrl.searchParams.set('su', 'Richiesta di informazioni');


    event.preventDefault();
    window.open(composeUrl.toString(), '_blank', 'noopener,noreferrer');
  });
}
