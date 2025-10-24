const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  direction: 'vertical'
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  const frameCount = 96;
  const images = [];
  let loaded = 0;

  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = `/assets/frames/${String(i).padStart(5, '0')}.jpg`; // 00001.jpg format
    img.onload = () => {
      loaded++;
      if (loaded === 1) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    images.push(img);
  }

  function drawFrame(index) {
    const img = images[index];
    if (img && img.complete) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  function update(scrollY) {
  const heroHeight = window.innerHeight * 3;
  const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
  const frameIndex = Math.floor(progress * (frameCount - 1));
  drawFrame(frameIndex);

  const start = 0.25;
  const end = 0.75;
  const range = end - start;
  const t = Math.min(Math.max((progress - start) / range, 0), 1);

  // Determine responsive target width
  let targetWidth;
  if (window.innerWidth <= 760) {
    targetWidth = window.innerWidth * 0.9;   // 90%
  } else if (window.innerWidth <= 1500) {
    targetWidth = window.innerWidth * 0.88;  // 88%
  } else {
    targetWidth = 1340;                      // fixed
  }

  const baseWidth = canvas.dataset.baseWidth
    ? parseFloat(canvas.dataset.baseWidth)
    : canvas.offsetWidth;
  canvas.dataset.baseWidth = baseWidth;

  const scaleWidth = baseWidth - (baseWidth - targetWidth) * t;
  const baseHeight = window.innerHeight;
  const targetHeight = window.innerHeight * 0.8;
  const scaleHeight = baseHeight - (baseHeight - targetHeight) * t;

  const radius = 32 * t;
  const margin = 10 * t;

  canvas.style.width = `${scaleWidth}px`;
  canvas.style.height = `${scaleHeight}px`;
  canvas.style.borderRadius = `${radius}px`;
  canvas.style.marginTop = `${margin}vh`;
  canvas.style.marginBottom = `${margin}vh`;

  const heroContainer = document.querySelector('.hero-container');
  const heroTitle = heroContainer.querySelector('h1');
  const heroPara = heroContainer.querySelector('p');
  const heroScroll = heroContainer.querySelector('.f-row');

  const fadeStart = 0.0;
  const fadeEnd = 0.12;
  const fadeRange = fadeEnd - fadeStart;
  const fadeProgress = Math.min(Math.max((progress - fadeStart) / fadeRange, 0), 1);

  const scale = 1 + 0.2 * fadeProgress;
  const blur = 5 * fadeProgress;
  const opacity = 1 - fadeProgress;

  heroContainer.style.transform = `scale(${scale})`;
  heroContainer.style.filter = `blur(${blur}px)`;
  heroContainer.style.opacity = `${opacity}`;

  const d = 0.05;
  const titleP = Math.min(1, Math.max(0, (fadeProgress - 0 * d) / (1 - 0 * d)));
  const paraP  = Math.min(1, Math.max(0, (fadeProgress - 1 * d) / (1 - 1 * d)));
  const scrP   = Math.min(1, Math.max(0, (fadeProgress - 2 * d) / (1 - 2 * d)));

  heroTitle.style.opacity = `${1 - titleP}`;
  heroPara.style.opacity = `${1 - paraP}`;
  heroScroll.style.opacity = `${1 - scrP}`;
}


  lenis.on('scroll', e => update(e.scroll));
});


document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('scrollText');
  if (!el) return;

  const words = el.textContent.trim().split(' ');
  el.innerHTML = words
    .map(
      word =>
        `<div class="word">${[...word]
          .map(l => `<span>${l}</span>`)
          .join('')}</div>`
    )
    .join(' ');

  const spans = [...el.querySelectorAll('span')];
  const section = document.querySelector('.scroll-text-section');
  if (!section) return;
  const sectionHeight = section.offsetHeight;

  const wrap = document.querySelector('.scroll-text-wrap');
  if (wrap) {
    const wrapHeight = wrap.offsetHeight;
    const top = window.innerHeight * 0.5 - wrapHeight / 2;
    wrap.style.top = `${top}px`;
  }

  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const scrollY = window.innerHeight - rect.top;
    const progress = Math.max(0, Math.min((scrollY - 300) / sectionHeight, 1));

    spans.forEach((span, i) => {
      const start = i / spans.length;
      const end = (i + 1) / spans.length;
      const opacity = Math.max(0, Math.min((progress - start) / (end - start), 1));
      span.style.opacity = opacity;
    });
  });

  window.addEventListener('load', () => {
  const root = document.querySelector('.js-flickity');
  if (!root) return;

  const track = root.querySelector('.flickity-slider');
  if (!track) return;

  const slides = Array.from(track.children);
  const wraps = slides.map(slide => {
    let w = slide.querySelector(':scope > .diag-wrap');
    if (!w) {
      w = document.createElement('div');
      w.className = 'diag-wrap';
      w.style.cssText = `
        width:100%;
        height:100%;
        transition:margin-top 0.02s ease;
        will-change: margin-top, opacity, filter;
      `;
      while (slide.firstChild) w.appendChild(slide.firstChild);
      slide.appendChild(w);
    }
    return w;
  });

  function getTx() {
    const t = getComputedStyle(track).transform;
    if (!t || t === 'none') return 0;
    const m = t.startsWith('matrix3d')
      ? t.slice(9, -1).split(',').map(Number)
      : t.slice(7, -1).split(',').map(Number);
    return t.startsWith('matrix3d') ? m[12] : m[4];
  }

  function clamp(n, a, b) {
    return n < a ? a : n > b ? b : n;
  }

  function update() {
    const tx = getTx();
    const viewWidth = root.clientWidth;
    const viewMid = viewWidth * 0.5;

    slides.forEach((slide, i) => {
      const centerX = slide.offsetLeft + slide.clientWidth * 0.5 + tx;
      const p = clamp((centerX - viewMid) / viewMid, -1, 1);
      const offsetY = 32 + 32 * p;
      wraps[i].style.marginTop = `${offsetY}px`;

      const slideLeft = slide.offsetLeft + tx;
      const slideRight = slideLeft + slide.clientWidth;

      let ratio = 1;
      if (slideRight < 0) ratio = 0;
      else if (slideLeft < 0) ratio = clamp(slideRight / slide.clientWidth, 0, 1);

      const opacity = ratio;
      const blur = (1 - ratio) * 5;

      wraps[i].style.opacity = opacity.toFixed(3);
      wraps[i].style.filter = `blur(${blur.toFixed(2)}px)`;
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
});




});