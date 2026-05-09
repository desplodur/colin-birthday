const IMAGES = [
  'images/8745b033-71fa-441e-86c9-c8f4ff465cae.JPG',
  'images/a2951b57-2dc1-4b7a-a2ab-7fe0a1871203.JPG',
  'images/ea6eff6b-742e-4db5-877c-ee57aadc4612.JPG',
  'images/fe0efe86-1fbc-44eb-9c38-b5a84a36e323.JPG',
  'images/IMG_3717.JPG',
  'images/IMG_3755.JPG',
  'images/IMG_3963.JPG',
  'images/IMG_9167.JPG',
];
const SLIDE_INTERVAL = 5000;

// ── Karussell ─────────────────────────────────────────────
const slidesEl = document.getElementById('carousel-slides');
const dotsEl = document.getElementById('carousel-dots');
let currentSlide = 0;

IMAGES.forEach((src, i) => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  if (i === 0) img.classList.add('active');
  slidesEl.appendChild(img);

  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dotsEl.appendChild(dot);
});

function goToSlide(index) {
  const imgs = slidesEl.querySelectorAll('img');
  const dots = dotsEl.querySelectorAll('.dot');
  imgs[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + IMAGES.length) % IMAGES.length;
  imgs[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

setInterval(() => goToSlide(currentSlide + 1), SLIDE_INTERVAL);

// ── Barcode (dekorativ) ───────────────────────────────────
(function buildBarcode() {
  const svg = document.getElementById('barcode-svg');
  const pattern = [3,1,2,1,3,1,1,2,1,3,2,1,1,3,1,2,1,1,3,1,2,3,1,1,2,1,3,1];
  let x = 0;
  pattern.forEach((w, i) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const h = 20 + (i % 3) * 6;
    rect.setAttribute('x', x);
    rect.setAttribute('y', (32 - h) / 2);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('fill', '#333');
    svg.appendChild(rect);
    x += w + 1;
  });
  svg.setAttribute('width', x);
})();

// ── Drag & Fly-out ────────────────────────────────────────
const ticket = document.getElementById('ticket');
const THRESHOLD = 120;

let isDragging = false;
let startX = 0, startY = 0;
let currentX = 0, currentY = 0;

function onStart(x, y) {
  isDragging = true;
  startX = x;
  startY = y;
  currentX = 0;
  currentY = 0;
  ticket.classList.add('dragging');
  ticket.classList.remove('returning');
}

function onMove(x, y) {
  if (!isDragging) return;
  currentX = x - startX;
  currentY = y - startY;
  const rotate = currentX * 0.12;
  ticket.style.transform =
    `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) rotate(${rotate}deg)`;
}

function onEnd() {
  if (!isDragging) return;
  isDragging = false;
  ticket.classList.remove('dragging');

  if (Math.hypot(currentX, currentY) > THRESHOLD) {
    flyOut();
  } else {
    returnToCenter();
  }
}

function flyOut() {
  const dist = Math.hypot(currentX, currentY);
  const factor = Math.max(window.innerWidth, window.innerHeight) / dist * 1.6;
  const tx = currentX * factor;
  const ty = currentY * factor;
  const rotate = currentX * 0.25;
  ticket.classList.add('flying-out');
  ticket.style.transform =
    `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rotate}deg)`;
  ticket.addEventListener('transitionend', () => {
    ticket.style.display = 'none';
    document.getElementById('swipe-hint').style.display = 'none';
  }, { once: true });
}

function returnToCenter() {
  ticket.classList.add('returning');
  ticket.style.transform = 'translate(-50%, -50%) rotate(0deg)';
  currentX = 0;
  currentY = 0;
}

ticket.addEventListener('touchstart', e => {
  e.preventDefault();
  onStart(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

ticket.addEventListener('touchmove', e => {
  e.preventDefault();
  onMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

ticket.addEventListener('touchend', onEnd);

ticket.addEventListener('mousedown', e => onStart(e.clientX, e.clientY));
document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
document.addEventListener('mouseup', onEnd);
