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
document.querySelectorAll('a, button, .artist-strip-card').forEach(el => {
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

// ── Latest Releases (dynamic from releases.json) ──
async function loadReleases() {
    const foeGrid = document.getElementById('foe-releases-grid');
    const dkeGrid = document.getElementById('dke-placements-grid');
    if (!foeGrid && !dkeGrid) return;

    try {
        const res = await fetch('releases.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load releases.json');
        const data = await res.json();

        if (foeGrid) {
            renderReleases(foeGrid, data.foe_releases || [], 'release');
        }
        if (dkeGrid) {
            const placements = data.dke_placements || [];
            if (placements.length === 0) {
                dkeGrid.innerHTML = '<p class="releases-empty">Placements coming soon.</p>';
            } else {
                renderReleases(dkeGrid, placements, 'placement');
            }
        }

        // Re-observe newly added cards for scroll reveal
        document.querySelectorAll('#foe-releases-grid .reveal, #dke-placements-grid .reveal')
            .forEach(el => revealObserver.observe(el));
    } catch (err) {
        console.error('Could not load releases:', err);
    }
}

function renderReleases(container, items, kind) {
    container.innerHTML = items.map((item, i) => {
        const delayClass = i > 0 ? `reveal-delay-${Math.min(i, 3)}` : '';
        const cover = item.cover_url
            ? `<img src="${escapeAttr(item.cover_url)}" alt="${escapeAttr(item.title || item.song_title || '')}" class="music-cover-img">`
            : `<div class="music-cover-placeholder">
                <svg viewBox="0 0 60 80" fill="none"><path d="M30 0C30 0 18 14 18 24C18 30.627 23.373 36 30 36C36.627 36 42 30.627 42 24C42 14 30 0 30 0Z" fill="#D4AF37"/><rect x="27" y="34" width="6" height="26" fill="#D4AF37" opacity="0.5"/><rect x="20" y="58" width="20" height="4" rx="1" fill="#D4AF37" opacity="0.4"/></svg>
            </div>`;

        const link = item.spotify_url || item.apple_url || '#';
        const target = link === '#' ? '' : 'target="_blank" rel="noopener"';

        let title, sub;
        if (kind === 'placement') {
            title = item.song_title || item.title || '';
            const artist = item.artist || '';
            const writers = item.writers ? ` · Written by ${item.writers}` : '';
            sub = `${artist}${writers}`;
        } else {
            title = item.title || '';
            sub = item.subtitle ? `${item.artist} · ${item.subtitle}` : item.artist;
        }

        return `
            <a href="${escapeAttr(link)}" ${target} class="music-card reveal ${delayClass}">
                <div class="music-cover">
                    ${cover}
                    <div class="music-play"><svg viewBox="0 0 24 24"><polygon points="8,5 20,12 8,19"/></svg></div>
                </div>
                <div class="music-title">${escapeHtml(title)}</div>
                <div class="music-artist">${escapeHtml(sub)}</div>
            </a>
        `;
    }).join('');
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

loadReleases();

// ── FAQ Accordion ──
function toggleFaq(btn) {
    const answer = btn.nextElementSibling;
    const toggle = btn.querySelector('.faq-toggle');
    const isOpen = answer.classList.contains('open');

    // Close all others
    document.querySelectorAll('.faq-answer.open').forEach(a => {
        a.classList.remove('open');
        a.previousElementSibling.querySelector('.faq-toggle').textContent = '+';
    });

    if (!isOpen) {
        answer.classList.add('open');
        toggle.textContent = '\u2212';
    }
}

// ── Newsletter Subscribe ──
function handleSubscribe(e) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const btn = e.target.querySelector('button');
    btn.textContent = 'Subscribed';
    btn.style.background = 'transparent';
    btn.style.color = '#D4AF37';
    input.value = '';
    setTimeout(() => {
        btn.textContent = 'Join the Movement';
        btn.style.background = '';
        btn.style.color = '';
    }, 3000);
    return false;
}
