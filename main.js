/* =========================================================
   Celebrations by Chanelle — interactions
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Site settings: edit these in one place ---------- */
  const CONFIG = {
    email: 'hello@celebrationsbychanelle.com.au',
    // Paste a Formspree (or similar) endpoint to send enquiries straight to your inbox,
    // e.g. 'https://formspree.io/f/abcdwxyz'. Left empty, the form opens a pre-filled email.
    formEndpoint: '',
    socials: {
      instagram: 'https://www.instagram.com/celebrationsbychanelle',
      facebook: 'https://www.facebook.com/celebrationsbychanelle',
      tiktok: 'https://www.tiktok.com/@celebrationsbychanelle',
      pinterest: 'https://www.pinterest.com.au/celebrationsbychanelle',
    },
  };

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Apply settings ---------- */
  $$('[data-email]').forEach((a) => {
    a.href = `mailto:${CONFIG.email}`;
    a.textContent = CONFIG.email;
  });
  $$('[data-social]').forEach((a) => {
    const url = CONFIG.socials[a.dataset.social];
    if (url) a.href = url;
    else a.closest('li')?.remove();
  });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Reveal on scroll ---------- */
  function startReveal() {
    const items = $$('[data-reveal]');
    const sections = $$('.section');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      sections.forEach((s) => s.classList.add('is-inview'));
      return;
    }

    const itemObserver = new IntersectionObserver((entries) => {
      let n = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--i', Math.min(n++, 6));
        entry.target.classList.add('is-visible');
        itemObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => itemObserver.observe(el));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        sectionObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ---------- Intro loader ---------- */
  let loaded = false;
  function finishLoading() {
    if (loaded) return;
    loaded = true;
    root.classList.add('is-loaded');
    startReveal();
  }
  if (reduceMotion) {
    finishLoading();
  } else {
    window.addEventListener('load', () => setTimeout(finishLoading, 700));
    setTimeout(finishLoading, 2600); // never hold the page hostage to slow assets
  }

  /* ---------- Header + hero parallax ---------- */
  const header = $('.header');
  const heroBg = $('.hero__bg');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (heroBg && !reduceMotion && y < window.innerHeight * 1.2) {
      heroBg.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Fullscreen menu ---------- */
  const menu = $('#menu');
  const toggle = $('.menu-toggle');
  const toggleLabel = $('.menu-toggle__label');
  const menuLinks = $$('.menu__list a');
  const menuImages = $$('.menu__img');
  let lastFocus = null;

  const isMenuOpen = () => menu.classList.contains('is-open');

  function setMenuOrigin() {
    const r = toggle.getBoundingClientRect();
    menu.style.setProperty('--cx', `${r.left + r.width / 2}px`);
    menu.style.setProperty('--cy', `${r.top + r.height / 2}px`);
  }

  function showMenuImage(index) {
    menuImages.forEach((img) => img.classList.toggle('is-active', img.dataset.index === String(index)));
  }

  function openMenu() {
    lastFocus = document.activeElement;
    setMenuOrigin();
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggleLabel.textContent = toggleLabel.dataset.close;
    root.classList.add('menu-open');
    const current = $('.menu__list a.is-current') || menuLinks[0];
    showMenuImage(current.dataset.media);
    setTimeout(() => current.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }

  function closeMenu({ restoreFocus = true } = {}) {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggleLabel.textContent = toggleLabel.dataset.open;
    root.classList.remove('menu-open');
    if (restoreFocus) (lastFocus && document.contains(lastFocus) ? lastFocus : toggle).focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => (isMenuOpen() ? closeMenu() : openMenu()));

  menuLinks.forEach((link) => {
    const show = () => showMenuImage(link.dataset.media);
    link.addEventListener('mouseenter', show);
    link.addEventListener('focus', show);
  });

  document.addEventListener('keydown', (e) => {
    if (!isMenuOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab') return;
    // Keep focus inside the menu (plus the close toggle)
    const focusables = [toggle, ...$$('a[href], button:not([disabled])', menu)];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!focusables.includes(document.activeElement)) { e.preventDefault(); first.focus(); }
  });

  window.addEventListener('resize', () => { if (isMenuOpen()) setMenuOrigin(); });

  /* ---------- Smooth anchor scrolling ---------- */
  function scrollToTarget(target) {
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', target.id === 'home' ? location.pathname : `#${target.id}`);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    const dialog = link.closest('dialog[open]');
    if (dialog) dialog.close();

    if (isMenuOpen()) {
      closeMenu({ restoreFocus: false });
      setTimeout(() => scrollToTarget(target), reduceMotion ? 0 : 380);
    } else {
      scrollToTarget(target);
    }
  });

  /* ---------- Active section tracking (menu + dots) ---------- */
  const dots = $('.dots');
  const dotLinks = $$('a', dots);
  const tracked = $$('main .section, .footer');

  function setActive(section) {
    const id = section.id;
    menuLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`));
    dotLinks.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    dots.dataset.tone = section.dataset.tone || 'light';
    dots.classList.toggle('is-hidden', id === 'footer');
  }

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    tracked.forEach((s) => activeObserver.observe(s));
  }

  /* ---------- Resource drawers ---------- */
  const supportsDialog = typeof HTMLDialogElement === 'function';

  function closeDrawer(dialog) {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (reduceMotion) { dialog.close(); return; }
    dialog.classList.add('is-closing');
    dialog.addEventListener('animationend', () => {
      dialog.classList.remove('is-closing');
      dialog.close();
    }, { once: true });
  }

  $$('[data-drawer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = document.getElementById(btn.dataset.drawer);
      if (!dialog || !supportsDialog) return;
      dialog.showModal();
      root.classList.add('drawer-open');
    });
  });

  $$('dialog.drawer').forEach((dialog) => {
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDrawer(dialog); });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDrawer(dialog); });
    dialog.addEventListener('close', () => root.classList.remove('drawer-open'));
    $$('[data-close]', dialog).forEach((b) => b.addEventListener('click', () => closeDrawer(dialog)));
  });

  /* ---------- Enquiry form ---------- */
  const form = $('#enquiry-form');
  if (form) {
    const status = $('.form__status', form);
    const submit = $('button[type="submit"]', form);
    const thanks = $('.form__thanks', form);
    const thanksMsg = $('.form__thanks-msg', form);

    const showThanks = (msg) => {
      thanksMsg.textContent = msg;
      form.classList.add('is-sent');
      thanks.setAttribute('aria-hidden', 'false');
      status.textContent = '';
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get('_gotcha')) return; // bot trap
      data.delete('_gotcha');

      submit.disabled = true;
      status.textContent = 'Sending…';

      try {
        if (CONFIG.formEndpoint) {
          const res = await fetch(CONFIG.formEndpoint, {
            method: 'POST',
            body: data,
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
          showThanks("I'll be in touch within 24–48 hours.");
        } else {
          const labels = {
            name: 'Name', partner: "Partner's name", email: 'Email', phone: 'Phone',
            date: 'Wedding date', location: 'Location / venue', guests: 'Estimated guests', message: 'Message',
          };
          const lines = Object.entries(labels)
            .map(([key, label]) => [label, String(data.get(key) || '').trim()])
            .filter(([, value]) => value)
            .map(([label, value]) => `${label}: ${value}`);
          const subject = `Wedding enquiry from ${data.get('name')}`;
          window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
          showThanks(`Your email app should open with your enquiry ready to send. If it doesn't, email me at ${CONFIG.email}.`);
        }
        form.reset();
      } catch (err) {
        status.textContent = `Something went wrong — please email ${CONFIG.email} directly.`;
      } finally {
        submit.disabled = false;
      }
    });

    $('[data-form-reset]', form)?.addEventListener('click', () => {
      form.classList.remove('is-sent');
      thanks.setAttribute('aria-hidden', 'true');
      $('input', form).focus();
    });
  }
})();
