import { CAKE_FLAVORS } from './data.js';
import { sound } from './audio.js';

export class HeroCarousel {
  constructor(experience) {
    this.exp = experience;
    this.currentIndex = 0;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.dragOffset = 0;

    // DOM Elements
    this.titleEl = document.getElementById('hero-cake-title');
    this.subtitleEl = document.getElementById('hero-cake-subtitle');
    this.taglineEl = document.getElementById('hero-cake-tagline');
    this.badgeEl = document.getElementById('hero-cake-badge');
    this.priceEl = document.getElementById('hero-cake-price');
    this.descEl = document.getElementById('hero-cake-desc');
    this.allergensEl = document.getElementById('hero-cake-allergens');
    this.ingredientsListEl = document.getElementById('hero-ingredients-list');

    this.barRichness = document.getElementById('meter-richness');
    this.barSweetness = document.getElementById('meter-sweetness');
    this.barCrunch = document.getElementById('meter-crunch');
    this.valIntensity = document.getElementById('val-intensity');

    this.prevBtn = document.getElementById('hero-prev-btn');
    this.nextBtn = document.getElementById('hero-next-btn');
    this.dotsContainer = document.getElementById('hero-carousel-dots');
    this.heroAura = document.getElementById('hero-bg-aura');

    this.initDots();
    this.bindEvents();
    this.updateUI(this.currentIndex, true);
  }

  initDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    CAKE_FLAVORS.forEach((flavor, idx) => {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Select ${flavor.name}`);
      dot.addEventListener('click', () => {
        this.goTo(idx);
      });
      this.dotsContainer.appendChild(dot);
    });
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // only if hero is in viewport
      if (window.scrollY < window.innerHeight * 0.8) {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      }
    });

    // Touch and Mouse drag on hero viewport
    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
      heroSection.addEventListener('mousedown', (e) => this.onDragStart(e.clientX));
      window.addEventListener('mousemove', (e) => this.onDragMove(e.clientX));
      window.addEventListener('mouseup', () => this.onDragEnd());

      heroSection.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) this.onDragStart(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (this.isDragging && e.touches.length === 1) this.onDragMove(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener('touchend', () => this.onDragEnd());
    }
  }

  onDragStart(x) {
    if (window.scrollY > window.innerHeight * 0.5) return;
    this.isDragging = true;
    this.startX = x;
    this.currentX = x;
  }

  onDragMove(x) {
    if (!this.isDragging) return;
    this.currentX = x;
    const diff = this.currentX - this.startX;
    // Normalized drag offset
    const normalized = diff / (window.innerWidth * 0.4);
    this.exp.setCarouselProgress(this.currentIndex - normalized);
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    const diff = this.currentX - this.startX;
    if (diff < -50) {
      this.next();
    } else if (diff > 50) {
      this.prev();
    } else {
      this.goTo(this.currentIndex);
    }
  }

  prev() {
    const total = CAKE_FLAVORS.length;
    const nextIdx = (this.currentIndex - 1 + total) % total;
    this.goTo(nextIdx);
  }

  next() {
    const total = CAKE_FLAVORS.length;
    const nextIdx = (this.currentIndex + 1) % total;
    this.goTo(nextIdx);
  }

  goTo(index) {
    sound.playSwoosh();
    this.currentIndex = index;
    this.exp.setActiveFlavor(index);
    this.updateUI(index);
  }

  updateUI(index, immediate = false) {
    const flavor = CAKE_FLAVORS[index];
    if (!flavor) return;

    // Retheme CSS variables dynamically
    document.documentElement.style.setProperty('--flavor-accent', flavor.accentColor);
    document.documentElement.style.setProperty('--flavor-primary', flavor.primaryColor);
    document.documentElement.style.setProperty('--flavor-glow', flavor.glowColor);
    document.documentElement.style.setProperty('--flavor-deep', flavor.deepBg);

    if (this.heroAura) {
      this.heroAura.style.background = `radial-gradient(circle at 50% 50%, ${flavor.glowColor} 0%, rgba(10, 8, 7, 0) 65%)`;
    }

    // Animate text transition
    const elementsToAnimate = [this.titleEl, this.subtitleEl, this.taglineEl, this.descEl, this.priceEl];
    elementsToAnimate.forEach(el => {
      if (el) {
        el.style.opacity = immediate ? '1' : '0';
        el.style.transform = immediate ? 'translateY(0)' : 'translateY(8px)';
      }
    });

    setTimeout(() => {
      if (this.titleEl) this.titleEl.textContent = flavor.name;
      if (this.subtitleEl) this.subtitleEl.textContent = flavor.subtitle;
      if (this.taglineEl) this.taglineEl.textContent = flavor.tagline;
      if (this.badgeEl) this.badgeEl.textContent = flavor.badge;
      if (this.priceEl) this.priceEl.textContent = flavor.price;
      if (this.descEl) this.descEl.textContent = flavor.description;
      if (this.allergensEl) this.allergensEl.textContent = flavor.allergens;

      // Update Ingredients chips
      if (this.ingredientsListEl) {
        this.ingredientsListEl.innerHTML = '';
        flavor.ingredients.forEach(ing => {
          const chip = document.createElement('span');
          chip.className = 'ingredient-pill';
          chip.textContent = ing;
          this.ingredientsListEl.appendChild(chip);
        });
      }

      // Update Sensory meters
      if (this.barRichness) this.barRichness.style.width = `${flavor.tasteProfile.richness}%`;
      if (this.barSweetness) this.barSweetness.style.width = `${flavor.tasteProfile.sweetness}%`;
      if (this.barCrunch) this.barCrunch.style.width = `${flavor.tasteProfile.crunch}%`;
      if (this.valIntensity) this.valIntensity.textContent = flavor.tasteProfile.intensity;

      // Update order button data
      const orderBtn = document.getElementById('hero-order-wa-btn');
      if (orderBtn) {
        const text = encodeURIComponent(`Hello Desire Premium! ✨ I would like to order the *${flavor.name}* (${flavor.price}) from your website. Please share availability & delivery to Vasai/Virar.`);
        orderBtn.href = `https://wa.me/919876543210?text=${text}`;
      }

      elementsToAnimate.forEach(el => {
        if (el) {
          el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    }, immediate ? 0 : 150);

    // Update Dots
    if (this.dotsContainer) {
      Array.from(this.dotsContainer.children).forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }
  }
}
