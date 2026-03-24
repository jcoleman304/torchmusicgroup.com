/* ═══════════════════════════════════════════════
   TORCH MUSIC GROUP — Site Scripts
   ═══════════════════════════════════════════════ */

// ── Loader ──
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1800);
});

// ── Custom Cursor ──
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX - 4 + 'px';
    dot.style.top = mouseY - 4 + 'px';
});

function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

// Enlarge cursor on hover over interactive elements
document.querySelectorAll('a, button, .roster-card, .music-card, .division-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        ring.style.width = '60px';
        ring.style.height = '60px';
        ring.style.opacity = '0.3';
        dot.style.transform = 'scale(2)';
    });
    el.addEventListener('mouseleave', () => {
        ring.style.width = '40px';
        ring.style.height = '40px';
        ring.style.opacity = '0.5';
        dot.style.transform = 'scale(1)';
    });
});

// ── Nav Scroll ──
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
});

// ── Mobile Menu ──
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('active', menuOpen);
    menuBtn.children[0].style.transform = menuOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    menuBtn.children[1].style.opacity = menuOpen ? '0' : '1';
    menuBtn.children[2].style.transform = menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
});

function closeMobile() {
    menuOpen = false;
    mobileMenu.classList.remove('active');
    menuBtn.children[0].style.transform = '';
    menuBtn.children[1].style.opacity = '1';
    menuBtn.children[2].style.transform = '';
}

// ── Particles ──
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    p.style.width = (1 + Math.random() * 2) + 'px';
    p.style.height = p.style.width;
    particlesContainer.appendChild(p);
}

// ── Scroll Reveal ──
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ── Hero Parallax ──
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const hero = document.querySelector('.hero-content');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});

// ── Smooth anchor scroll ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ── Nav logo swap on scroll (gold on dark bg) ──
const navLogo = document.getElementById('navLogo');
if (navLogo) {
    window.addEventListener('scroll', () => {
        // Single icon used throughout — no swap needed
        navLogo.src = 'images/tmg-gold-icon.png';
    });
}
