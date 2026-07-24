/* ============================================================
   Gihan — Portfolio JavaScript
   1. Navbar
   2. Smooth scroll
   3. Fade-in on scroll
   4. Skill bars
   5. Card thumbnails (static, professional grid)
   6. Modal — ArtStation-style stacked image + video feed
   7. Contact form (EmailJS)
   8. Back to top
   9. Fullscreen image lightbox (zoom on click)
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


/* ── 5. CARD THUMBNAILS ── */
// Each grid card just shows its first image as a clean static thumbnail.
// (Full gallery + video only appear once the project is opened in the modal.)
document.querySelectorAll('.project-card').forEach((card) => {
  const slides = JSON.parse(card.getAttribute('data-slides') || '[]');
  if (!slides.length) return;

  const thumbWrap = card.querySelector('.card-thumb');
  const img = document.createElement('img');
  img.src = slides[0];
  img.alt = card.getAttribute('data-title') || 'Project thumbnail';
  img.loading = 'lazy';
  thumbWrap.insertBefore(img, thumbWrap.firstChild);
});


/* ── 6. MODAL — ArtStation-style project detail ── */
// Clicking a project opens every image AND the YouTube video (if provided)
// stacked together in one scrollable feed, the way ArtStation project
// pages present their media.
const modalOverlay  = document.getElementById('modalOverlay');
const modal          = document.getElementById('modal');
const modalClose    = document.getElementById('modalClose');
const modalTitle    = document.getElementById('modalTitle');
const modalCat      = document.getElementById('modalCat');
const modalDesc     = document.getElementById('modalDesc');
const modalMediaFeed = document.getElementById('modalMediaFeed');

// Accepts a plain YouTube watch/share URL OR an already-formed embed URL
// and always returns a valid https://www.youtube.com/embed/... URL.
function toYouTubeEmbed(url) {
  if (!url) return '';
  url = url.trim();
  if (!url) return '';
  if (url.includes('/embed/')) return url;

  let videoId = '';
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  const shortMatch  = url.match(/youtu\.be\/([^?&]+)/);
  if (watchMatch) videoId = watchMatch[1];
  else if (shortMatch) videoId = shortMatch[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

// Builds the stacked media feed: every project image, then the video (if any)
function buildModalGallery(slides, videoUrl) {
  modalMediaFeed.innerHTML = '';

  slides.forEach((src, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'media-image-wrap';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Project image ' + (i + 1);
    img.loading = 'lazy';
    wrap.appendChild(img);
    wrap.addEventListener('click', () => window.openFsLightbox(slides, i));
    modalMediaFeed.appendChild(wrap);
  });

  if (videoUrl && videoUrl.trim() !== '') {
    const videoWrap = document.createElement('div');
    videoWrap.className = 'media-video-wrap';
    const iframe = document.createElement('iframe');
    iframe.src = toYouTubeEmbed(videoUrl);
    iframe.title = 'Project video';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    videoWrap.appendChild(iframe);
    modalMediaFeed.appendChild(videoWrap);
  }
}

// Open modal when a project card is clicked
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('click', () => {
    const slides = JSON.parse(card.getAttribute('data-slides') || '[]');
    const video  = card.getAttribute('data-video');

    modalTitle.textContent = card.getAttribute('data-title');
    modalCat.textContent   = card.getAttribute('data-category');
    modalDesc.textContent  = card.getAttribute('data-desc');

    buildModalGallery(slides, video);

    modal.scrollTop = 0;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  // Stop any playing video by clearing its iframe src
  const iframe = modalMediaFeed.querySelector('iframe');
  if (iframe) iframe.src = '';
}
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => {
  if (!modalOverlay.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
});


/* ── 7. CONTACT FORM ── */
/* ── 7. CONTACT FORM (EmailJS) ── */

// Initialize EmailJS
emailjs.init({
    publicKey: "6mOWJE0Vu-bKRuHcw"
});

const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');

    btn.disabled = true;
    btn.textContent = "Sending...";

    emailjs.sendForm(
        "service_jsaztb8",
        "template_2wrtzhy",
        this
    )
    .then(() => {

        btn.disabled = false;
        btn.textContent = "Send Message ➤";

        formSuccess.innerHTML = "✅ Message sent successfully!";
        formSuccess.classList.add("show");

        contactForm.reset();

        setTimeout(() => {
            formSuccess.classList.remove("show");
        }, 5000);

    })
    .catch((error) => {

        console.error(error);

        btn.disabled = false;
        btn.textContent = "Send Message ➤";

        formSuccess.innerHTML = "❌ Failed to send message.";
        formSuccess.classList.add("show");
    });
});


/* ── 8. BACK TO TOP ── */
// Handled by scroll listener (section 1) + anchor smooth scroll (section 2)

console.log('Gihan Portfolio — slideshow gallery loaded ✓');


/* ── FULLSCREEN IMAGE LIGHTBOX ── */
(function () {
  const fsLightbox = document.getElementById('fsLightbox');
  const fsImg      = document.getElementById('fsImg');
  const fsClose    = document.getElementById('fsClose');
  const fsPrev     = document.getElementById('fsPrev');
  const fsNext     = document.getElementById('fsNext');
  const fsCounter  = document.getElementById('fsCounter');

  let fsSlides  = [];
  let fsCurrent = 0;

  function openFs(slides, index) {
    fsSlides  = slides;
    fsCurrent = index;
    fsImg.src = slides[index];
    fsCounter.textContent = (index + 1) + ' / ' + slides.length;
    // Show/hide nav arrows
    fsPrev.style.display = slides.length > 1 ? '' : 'none';
    fsNext.style.display = slides.length > 1 ? '' : 'none';
    fsLightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeFs() {
    fsLightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { fsImg.src = ''; }, 300);
  }

  function fsGoTo(i) {
    fsCurrent = (i + fsSlides.length) % fsSlides.length;
    // Fade swap
    fsImg.style.opacity = '0';
    setTimeout(() => {
      fsImg.src = fsSlides[fsCurrent];
      fsImg.style.opacity = '1';
    }, 150);
    fsCounter.textContent = (fsCurrent + 1) + ' / ' + fsSlides.length;
  }

  fsClose.addEventListener('click', closeFs);
  fsLightbox.addEventListener('click', e => { if (e.target === fsLightbox || e.target === document.querySelector('.fs-img-wrap')) closeFs(); });
  fsPrev.addEventListener('click', e => { e.stopPropagation(); fsGoTo(fsCurrent - 1); });
  fsNext.addEventListener('click', e => { e.stopPropagation(); fsGoTo(fsCurrent + 1); });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!fsLightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeFs();
    if (e.key === 'ArrowLeft')   fsGoTo(fsCurrent - 1);
    if (e.key === 'ArrowRight')  fsGoTo(fsCurrent + 1);
  });

  // Smooth opacity transition for image swap
  fsImg.style.transition = 'opacity 0.15s ease';

  // Exposed globally so the modal's stacked image feed (buildModalGallery
  // in section 6) can open any clicked image in fullscreen zoom mode.
  window.openFsLightbox = openFs;
})();
