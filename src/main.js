import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Experience } from './experience.js';
import { HeroCarousel } from './carousel.js';
import { ScrollStory } from './story.js';
import { BoxStudio } from './boxStudio.js';
import { BoutiqueManager } from './boutique.js';
import { sound } from './audio.js';

gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.preloader = document.getElementById('preloader');
    this.barFill = document.getElementById('preloader-bar-fill');
    this.percentNum = document.getElementById('preloader-percent-num');
    this.statusText = document.getElementById('preloader-status-text');

    this.lenis = null;
    this.experience = null;
    this.carousel = null;
    this.story = null;
    this.boxStudio = null;
    this.boutique = null;

    this.initSmoothScroll();
    this.startPreloader();
  }

  initSmoothScroll() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5
    });

    // Pause scroll during preloader
    this.lenis.stop();

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  startPreloader() {
    let progress = 0;
    const stages = [
      { at: 15, text: 'Preheating stone hearth ovens...' },
      { at: 40, text: 'Melting 70% Belgian Callebaut cocoa...' },
      { at: 65, text: 'Whipping Madagascar vanilla bean ganache...' },
      { at: 85, text: 'Tempering 24K edible gold leaf...' },
      { at: 98, text: 'Sensory experience ready to indulge!' }
    ];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 6) + 3;
      if (progress > 100) progress = 100;

      if (this.barFill) this.barFill.style.width = `${progress}%`;
      if (this.percentNum) this.percentNum.textContent = `${progress}%`;

      const curStage = stages.slice().reverse().find(s => progress >= s.at);
      if (curStage && this.statusText) {
        this.statusText.textContent = curStage.text;
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => this.finishBoot(), 400);
      }
    }, 45);
  }

  finishBoot() {
    // Initialize 3D WebGL scene and interactive systems
    this.experience = new Experience(this.canvas);
    this.carousel = new HeroCarousel(this.experience);
    this.story = new ScrollStory(this.experience);
    this.boxStudio = new BoxStudio();
    this.boutique = new BoutiqueManager();

    this.setupAudioToggle();

    // Reveal page and start smooth scroll
    if (this.preloader) {
      this.preloader.classList.add('loaded');
    }
    if (this.lenis) {
      this.lenis.start();
    }

    sound.playChime(523.25);

    // Intro Hero animation
    gsap.from('.hero-left-column', {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.2
    });
  }

  setupAudioToggle() {
    const btn = document.getElementById('audio-toggle-btn');
    const icon = document.getElementById('audio-icon');
    const label = document.getElementById('audio-label');

    if (!btn) return;
    btn.addEventListener('click', () => {
      const isEnabled = sound.toggle();
      if (icon) icon.textContent = isEnabled ? '🔊' : '🔇';
      if (label) label.textContent = isEnabled ? 'Sound On' : 'Sound Muted';
      if (isEnabled) sound.playChime(880);
    });
  }
}

// Boot on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
