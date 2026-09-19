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
  initBackToTop();
  initEmailModal();
  initCopyEmail();
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
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Chiude il menu quando si clicca un link (utile su mobile)
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
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
   POPUP INVIO EMAIL — apre il client di posta con Nome, Email e Messaggio
   già compilati (mailto:)
   -------------------------------------------------------------------------- */

function initEmailModal() {
  // Cambia qui l'indirizzo email della clinica se dovesse cambiare in futuro
  const CLINIC_EMAIL = 'ruggierililli@gmail.com'/*mirawankelmuth@hotmail.it*/;
 
  const overlay = document.getElementById('email-modal-overlay');
  const closeBtn = document.getElementById('email-modal-close');
  const form = document.getElementById('email-modal-form');
  const feedback = document.getElementById('email-modal-feedback');
  const triggers = document.querySelectorAll('.email-modal-trigger');
 
  if (!overlay || !closeBtn || !form || !triggers.length) return;
 
  const nameInput = document.getElementById('email-modal-name');
  const emailInput = document.getElementById('email-modal-email');
  const messageInput = document.getElementById('email-modal-message');
 
  function openModal() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // blocca lo scroll dietro il popup
    nameInput.focus();
  }
 
  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    form.reset();
    feedback.textContent = '';
  }
 
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });
 
  closeBtn.addEventListener('click', closeModal);
 
  // Chiude cliccando fuori dal box o con Esc
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
 
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();
 
    if (!form.checkValidity()) {
      feedback.textContent = 'Compila tutti i campi prima di continuare.';
      feedback.style.color = '#c0392b';
      return;
    }
 
    const name = nameInput.value.trim();
    const senderEmail = emailInput.value.trim();
    const message = messageInput.value.trim();
 
    const subject = `Richiesta dal sito da ${name}`;
    const body =
      `Nome: ${name}\n` +
      `Email per ricontattarmi: ${senderEmail}\n\n` +
      `Messaggio:\n${message}`;
 
    const mailtoLink =
      `mailto:${CLINIC_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
 
    // Apre il client di posta del visitatore con tutto già compilato
    window.location.href = mailtoLink;
 
    feedback.textContent = 'Si sta aprendo il tuo programma di posta...';
    feedback.style.color = 'var(--color-primary)';
 
    setTimeout(closeModal, 1800);
  });
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