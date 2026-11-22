import confetti from 'canvas-confetti';
import { TASTING_BOX_ITEMS } from './data.js';
import { sound } from './audio.js';

export class BoxStudio {
  constructor() {
    this.selectedItems = []; // up to 4 items
    this.maxItems = 4;

    this.gridContainer = document.getElementById('box-items-grid');
    this.traySlots = document.querySelectorAll('.tasting-box-slot');
    this.boxCounter = document.getElementById('box-item-count');
    this.boxTotal = document.getElementById('box-total-price');
    this.checkoutBtn = document.getElementById('box-order-btn');
    this.resetBtn = document.getElementById('box-reset-btn');

    this.renderItems();
    this.bindEvents();
    this.updateTray();
  }

  renderItems() {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    TASTING_BOX_ITEMS.forEach(item => {
      const card = document.createElement('div');
      card.className = 'box-selection-card';
      card.innerHTML = `
        <div class="box-card-icon" style="background: ${item.color}">${item.icon}</div>
        <div class="box-card-details">
          <h4>${item.name}</h4>
          <p class="flavor-sub">${item.flavor}</p>
          <span class="box-card-price">₹${item.price}</span>
        </div>
        <button class="box-add-btn" aria-label="Add ${item.name} to box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      `;

      const addBtn = card.querySelector('.box-add-btn');
      addBtn.addEventListener('click', (e) => {
        this.addItem(item, e.currentTarget);
      });

      this.gridContainer.appendChild(card);
    });
  }

  bindEvents() {
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.selectedItems = [];
        this.updateTray();
      });
    }

    this.traySlots.forEach((slot, idx) => {
      slot.addEventListener('click', () => {
        if (this.selectedItems[idx]) {
          this.removeItem(idx);
        }
      });
    });
  }

  addItem(item, sourceBtn) {
    if (this.selectedItems.length >= this.maxItems) {
      sound.playCrunch();
      this.showNotice('Box is already full! Tap a slot to remove or checkout below.');
      return;
    }

    sound.playBoxDrop();
    const targetSlotIndex = this.selectedItems.length;
    this.selectedItems.push(item);

    // Optional flight visual animation
    if (sourceBtn && this.traySlots[targetSlotIndex]) {
      this.animateFly(sourceBtn, this.traySlots[targetSlotIndex]);
    }

    this.updateTray();

    if (this.selectedItems.length === this.maxItems) {
      sound.playCelebration();
      this.triggerConfetti();
    }
  }

  removeItem(index) {
    sound.playChime(350);
    this.selectedItems.splice(index, 1);
    this.updateTray();
  }

  updateTray() {
    const total = this.selectedItems.reduce((acc, curr) => acc + curr.price, 0);

    if (this.boxCounter) {
      this.boxCounter.textContent = `${this.selectedItems.length} / ${this.maxItems}`;
    }
    if (this.boxTotal) {
      this.boxTotal.textContent = `₹${total}`;
    }

    this.traySlots.forEach((slot, idx) => {
      const item = this.selectedItems[idx];
      slot.innerHTML = '';
      if (item) {
        slot.classList.add('filled');
        slot.innerHTML = `
          <div class="slot-content" style="border-color: ${item.color}">
            <span class="slot-icon">${item.icon}</span>
            <span class="slot-name">${item.name}</span>
            <span class="slot-remove-hint">×</span>
          </div>
        `;
      } else {
        slot.classList.remove('filled');
        slot.innerHTML = `
          <div class="slot-empty">
            <span class="slot-number">Slot 0${idx + 1}</span>
            <span class="slot-plus">+</span>
          </div>
        `;
      }
    });

    if (this.checkoutBtn) {
      const isFull = this.selectedItems.length === this.maxItems;
      this.checkoutBtn.disabled = !isFull;
      if (isFull) {
        this.checkoutBtn.classList.add('ready');
        const itemNames = this.selectedItems.map(i => i.name).join(', ');
        const waMsg = encodeURIComponent(
          `Hello Desire Premium! ✨ I curated a 4-Piece Grand Tasting Box on your website:\n\n• ${this.selectedItems.map(i => i.name + ' (₹' + i.price + ')').join('\n• ')}\n\nTotal: ₹${total}\nPlease confirm order & express delivery to Vasai/Virar!`
        );
        this.checkoutBtn.onclick = () => {
          window.open(`https://wa.me/919876543210?text=${waMsg}`, '_blank');
        };
      } else {
        this.checkoutBtn.classList.remove('ready');
        this.checkoutBtn.onclick = null;
      }
    }
  }

  animateFly(sourceEl, targetEl) {
    const sRect = sourceEl.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();

    const clone = document.createElement('div');
    clone.className = 'flight-particle';
    clone.style.left = `${sRect.left + sRect.width / 2}px`;
    clone.style.top = `${sRect.top + sRect.height / 2}px`;
    document.body.appendChild(clone);

    const destX = tRect.left + tRect.width / 2;
    const destY = tRect.top + tRect.height / 2;

    clone.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(${destX - (sRect.left + sRect.width / 2)}px, ${destY - (sRect.top + sRect.height / 2)}px) scale(0.6)`, opacity: 0.8 }
    ], {
      duration: 450,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    }).onfinish = () => clone.remove();
  }

  triggerConfetti() {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#d4af37', '#e63946', '#ffd166', '#ffffff']
      });
    } catch (e) {
      console.log('Confetti burst');
    }
  }

  showNotice(msg) {
    const banner = document.getElementById('box-notice-banner');
    if (!banner) return;
    banner.textContent = msg;
    banner.classList.add('visible');
    setTimeout(() => {
      banner.classList.remove('visible');
    }, 3000);
  }
}
