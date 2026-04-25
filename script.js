/* ============================================================
   Gihan — Portfolio JavaScript
   1. Navbar
   2. Smooth scroll
   3. Fade-in on scroll
   4. Skill bars
   5. Card slideshows (auto-advance + prev/next + dots)
   6. Modal with big slideshow + thumbnail grid
   7. Contact form
   8. Back to top
   ============================================================ */


/* ── 1. NAVBAR ── */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('backTop').classList.toggle('show', window.scrollY > 500);
});
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});


/* ── 2. SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight, behavior: 'smooth' });
  });
});


/* ── 3. FADE-IN ON SCROLL ── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));


/* ── 4. SKILL BARS ── */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.skill-fill').forEach(f => f.style.width = f.getAttribute('data-w') + '%');
      skillObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
const aboutEl = document.querySelector('.about');
if (aboutEl) skillObserver.observe(aboutEl);


/* ── 5. CARD SLIDESHOWS ── */
// Saves each card's current slide index so modal can open on the same image
const cardStates = [];

document.querySelectorAll('.project-card').forEach((card, idx) => {
  const slides = JSON.parse(card.getAttribute('data-slides') || '[]');
  if (!slides.length) return;

  const wrap    = card.querySelector('.card-slideshow');
  const dotsEl  = card.querySelector('.slide-dots');
  const prevBtn = card.querySelector('.slide-prev');
  const nextBtn = card.querySelector('.slide-next');
  let current   = 0;
  let autoTimer = null;

  // Build slide <img> elements
  slides.forEach((src, i) => {
    const img     = document.createElement('img');
    img.src       = src;
    img.alt       = card.getAttribute('data-title') + ' — photo ' + (i + 1);
    img.className = 'card-slide' + (i === 0 ? ' active' : '');
    img.loading   = 'lazy';
    wrap.insertBefore(img, prevBtn);
  });

  // Build dot indicators
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
    dotsEl.appendChild(dot);
  });

  function goTo(i) {
    wrap.querySelectorAll('.card-slide')[current].classList.remove('active');
    dotsEl.querySelectorAll('.slide-dot')[current].classList.remove('active');
    current = (i + slides.length) % slides.length;
    wrap.querySelectorAll('.card-slide')[current].classList.add('active');
    dotsEl.querySelectorAll('.slide-dot')[current].classList.add('active');
  }

  prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); resetAuto(); });

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 2200); }
  function stopAuto()  { clearInterval(autoTimer); }
  function resetAuto() { stopAuto(); startAuto(); }
  card.addEventListener('mouseenter', startAuto);
  card.addEventListener('mouseleave', stopAuto);

  cardStates[idx] = { slides, getCurrent: () => current };
});


/* ── 6. MODAL WITH FULL GALLERY ── */
const modalOverlay   = document.getElementById('modalOverlay');
const modalClose     = document.getElementById('modalClose');
const modalTitle     = document.getElementById('modalTitle');
const modalCat       = document.getElementById('modalCat');
const modalDesc      = document.getElementById('modalDesc');
const modalThumbs    = document.getElementById('modalThumbs');
const modalDots      = document.getElementById('modalDots');
const modalPrev      = document.getElementById('modalPrev');
const modalNext      = document.getElementById('modalNext');
const modalVideoWrap = document.getElementById('modalVideoWrap');
const modalVideo     = document.getElementById('modalVideo');
const modalSlideshow = document.getElementById('modalSlideshow');

let modalCurrent = 0;
let modalSlides  = [];

// Builds big slideshow + thumbnail grid inside the modal
function buildModalGallery(slides, startIndex) {
  // Clear previous
  modalSlideshow.querySelectorAll('.modal-slide, .modal-slide-counter').forEach(el => el.remove());
  modalDots.innerHTML   = '';
  modalThumbs.innerHTML = '';
  modalSlides  = slides;
  modalCurrent = startIndex || 0;

  // Big slide images
  slides.forEach((src, i) => {
    const img     = document.createElement('img');
    img.src       = src;
    img.className = 'modal-slide' + (i === modalCurrent ? ' active' : '');
    img.alt       = 'Photo ' + (i + 1);
    modalSlideshow.insertBefore(img, modalPrev);
  });

  // Counter  "1 / 3"
  const counter = document.createElement('div');
  counter.className   = 'modal-slide-counter';
  counter.id          = 'modalCounter';
  counter.textContent = (modalCurrent + 1) + ' / ' + slides.length;
  modalSlideshow.insertBefore(counter, modalPrev);

  // Dots
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'modal-slide-dot' + (i === modalCurrent ? ' active' : '');
    dot.addEventListener('click', () => modalGoTo(i));
    modalDots.appendChild(dot);
  });

  // Thumbnail grid — ALL images visible, click to jump
  slides.forEach((src, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'modal-thumb' + (i === modalCurrent ? ' active' : '');
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Thumbnail ' + (i + 1);
    thumb.appendChild(img);
    thumb.addEventListener('click', () => modalGoTo(i));
    modalThumbs.appendChild(thumb);
  });
}

// Jump to a specific slide inside modal
function modalGoTo(i) {
  const imgs   = modalSlideshow.querySelectorAll('.modal-slide');
  const dots   = modalDots.querySelectorAll('.modal-slide-dot');
  const thumbs = modalThumbs.querySelectorAll('.modal-thumb');
  const ctr    = document.getElementById('modalCounter');

  imgs[modalCurrent].classList.remove('active');
  dots[modalCurrent].classList.remove('active');
  thumbs[modalCurrent].classList.remove('active');

  modalCurrent = (i + modalSlides.length) % modalSlides.length;

  imgs[modalCurrent].classList.add('active');
  dots[modalCurrent].classList.add('active');
  thumbs[modalCurrent].classList.add('active');
  if (ctr) ctr.textContent = (modalCurrent + 1) + ' / ' + modalSlides.length;
}

modalPrev.addEventListener('click', () => modalGoTo(modalCurrent - 1));
modalNext.addEventListener('click', () => modalGoTo(modalCurrent + 1));

// Keyboard arrows
document.addEventListener('keydown', e => {
  if (!modalOverlay.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  modalGoTo(modalCurrent - 1);
  if (e.key === 'ArrowRight') modalGoTo(modalCurrent + 1);
  if (e.key === 'Escape')     closeModal();
});

// Open modal when card is clicked
document.querySelectorAll('.project-card').forEach((card, idx) => {
  card.addEventListener('click', e => {
    if (e.target.closest('.slide-btn')) return; // ignore arrow clicks

    const slides = JSON.parse(card.getAttribute('data-slides') || '[]');
    const video  = card.getAttribute('data-video');

    modalTitle.textContent = card.getAttribute('data-title');
    modalCat.textContent   = card.getAttribute('data-category');
    modalDesc.textContent  = card.getAttribute('data-desc');

    const startIndex = cardStates[idx] ? cardStates[idx].getCurrent() : 0;

    if (video && video.trim() !== '') {
      modalSlideshow.style.display = 'none';
      modalVideoWrap.style.display = 'block';
      modalVideo.src = video;
    } else {
      modalSlideshow.style.display = '';
      modalVideoWrap.style.display = 'none';
      modalVideo.src = '';
      buildModalGallery(slides, startIndex);
    }

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  modalVideo.src = '';
}
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });


/* ── 7. CONTACT FORM ── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send Message ➤';
    btn.disabled = false;
    formSuccess.classList.add('show');
    contactForm.reset();
    setTimeout(() => formSuccess.classList.remove('show'), 5000);
  }, 1200);
});


/* ── 8. BACK TO TOP ── */
// Handled by scroll listener (section 1) + anchor smooth scroll (section 2)

console.log('Gihan Portfolio — slideshow gallery loaded ✓');
