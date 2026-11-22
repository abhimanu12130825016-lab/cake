import { BOUTIQUE_MENU, TESTIMONIALS, STORE_LOCATIONS } from './data.js';
import { sound } from './audio.js';

export class BoutiqueManager {
  constructor() {
    this.menuGrid = document.getElementById('boutique-menu-grid');
    this.filterBtns = document.querySelectorAll('.boutique-filter-btn');
    this.reviewsContainer = document.getElementById('reviews-carousel');
    this.locationsContainer = document.getElementById('locations-grid');

    this.activeFilter = 'all';

    this.renderMenu();
    this.renderReviews();
    this.renderLocations();
    this.bindEvents();
  }

  renderMenu() {
    if (!this.menuGrid) return;
    this.menuGrid.innerHTML = '';

    const items = this.activeFilter === 'all'
      ? BOUTIQUE_MENU
      : BOUTIQUE_MENU.filter(item => item.category === this.activeFilter);

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'boutique-cake-card';
      card.innerHTML = `
        <div class="boutique-card-top">
          <div class="boutique-tags">
            ${item.tags.map(t => `<span class="boutique-tag">${t}</span>`).join('')}
          </div>
          <span class="boutique-rating">${item.rating}</span>
        </div>
        <div class="boutique-card-body">
          <h3>${item.name}</h3>
          <p class="boutique-card-desc">${item.desc}</p>
        </div>
        <div class="boutique-card-footer">
          <div class="price-wrap">
            <span class="price-val">${item.price}</span>
            <span class="price-weight">/ ${item.weight}</span>
          </div>
          <a class="boutique-order-btn" href="https://wa.me/919876543210?text=${encodeURIComponent('Hello Desire Premium! I would like to order: ' + item.name + ' (' + item.price + ')')}" target="_blank">
            Order
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      `;

      card.addEventListener('mouseenter', () => sound.playChime(660));
      this.menuGrid.appendChild(card);
    });
  }

  renderReviews() {
    if (!this.reviewsContainer) return;
    this.reviewsContainer.innerHTML = '';

    TESTIMONIALS.forEach(rev => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-stars">${rev.rating}</div>
        <p class="review-quote">"${rev.quote}"</p>
        <div class="review-author-wrap">
          <div class="author-avatar">${rev.author.charAt(0)}</div>
          <div>
            <div class="author-name">${rev.author}</div>
            <div class="author-loc">📍 ${rev.location} · <span class="author-tag">${rev.tag}</span></div>
          </div>
        </div>
      `;
      this.reviewsContainer.appendChild(card);
    });
  }

  renderLocations() {
    if (!this.locationsContainer) return;
    this.locationsContainer.innerHTML = '';

    STORE_LOCATIONS.forEach(loc => {
      const card = document.createElement('div');
      card.className = 'location-card';
      card.innerHTML = `
        <div class="location-header">
          <div class="location-icon">📍</div>
          <div>
            <h3>${loc.city}</h3>
            <p class="location-area">${loc.area}</p>
          </div>
        </div>
        <ul class="location-features">
          ${loc.features.map(f => `<li>✓ ${f}</li>`).join('')}
        </ul>
        <a class="location-cta" href="https://wa.me/919876543210?text=${encodeURIComponent('Hello Desire Premium! I need cake delivery in ' + loc.city)}" target="_blank">
          Request Delivery in ${loc.city} →
        </a>
      `;
      this.locationsContainer.appendChild(card);
    });
  }

  bindEvents() {
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playChime(500);
        this.filterBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeFilter = e.currentTarget.dataset.filter;
        this.renderMenu();
      });
    });

    // Accordion setup
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-question');
      if (q) {
        q.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          faqItems.forEach(i => i.classList.remove('open'));
          if (!isOpen) {
            item.classList.add('open');
            sound.playChime(440);
          }
        });
      }
    });
  }
}
