import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sound } from './audio.js';

gsap.registerPlugin(ScrollTrigger);

export class ScrollStory {
  constructor(experience) {
    this.exp = experience;
    this.section = document.getElementById('story-section');
    this.chapterCards = document.querySelectorAll('.story-chapter-card');
    this.backdropWord = document.getElementById('story-backdrop-word');
    this.progressBar = document.getElementById('story-progress-indicator');
    this.chapterIndexDisplay = document.getElementById('story-current-chapter');

    this.chapters = [
      { num: '01', title: 'The Foundation', word: 'SPONGE', note: 'Slow-baked, melt-in-mouth dark cocoa & almond crumb sponge' },
      { num: '02', title: 'The Crunch Core', word: 'CRUNCH', note: 'Caramelized roasted hazelnut praline & crispy Belgian pearls' },
      { num: '03', title: 'The Ganache Velvet', word: 'MOUSSE', note: '70% pure Callebaut chocolate folded with dairy creme' },
      { num: '04', title: 'The Royal Glaze', word: 'MIRROR', note: 'High-gloss mirror glaze with 24K edible gold leaf & fresh fruit' }
    ];

    this.initTimeline();
  }

  initTimeline() {
    if (!this.section) return;

    ScrollTrigger.create({
      trigger: this.section,
      start: 'top top',
      end: '+=2500',
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const progress = self.progress;
        this.exp.setStoryProgress(progress);

        if (this.progressBar) {
          this.progressBar.style.width = `${progress * 100}%`;
        }

        // Determine current chapter (0..3)
        const chapterIdx = Math.min(3, Math.floor(progress * 4));
        this.updateChapter(chapterIdx);
      }
    });
  }

  updateChapter(idx) {
    if (this.activeIdx === idx) return;
    this.activeIdx = idx;
    sound.playCrunch();

    const data = this.chapters[idx];
    if (this.backdropWord && data) {
      this.backdropWord.textContent = data.word;
    }
    if (this.chapterIndexDisplay && data) {
      this.chapterIndexDisplay.textContent = `CHAPTER ${data.num} / 04`;
    }

    // Highlight active card
    this.chapterCards.forEach((card, cardIdx) => {
      card.classList.toggle('active', cardIdx === idx);
    });
  }
}
