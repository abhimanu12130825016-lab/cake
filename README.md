# Desire Premium — 3D Sensory Cake Experience

An ultra-luxury, scroll-driven 3D sensory website built for **Desire Premium Cakes & Confections** ([@desirepremium.in](https://www.instagram.com/desirepremium.in)), engineered with the exact architectural patterns, WebGL mechanics, and interactive storytelling demonstrated in [alagappan567/lays-crunch-experience](https://github.com/alagappan567/lays-crunch-experience).

---

## 🎂 Features & Architecture Mapping

| Lay's Crunch Experience Feature | Desire Premium Implementation |
| :--- | :--- |
| **Cinematic Preloader** | Preheating oven & Callebaut melting simulation with dynamic percentage tracker (0% → 100%) and velvet reveal transition. |
| **Hero 3D Carousel** | Real 3D procedural cakes with glossy mirror glazes, macarons, and gold dust arranged along an interactive circular arc. |
| **Dynamic Page Retheming** | Real-time CSS custom property blending (`--flavor-accent`, `--flavor-glow`, aura rings) as user switches cakes. |
| **Interactive Sensory Meters** | Real-time taste profile analysis (Richness, Sweetness, Crunch, Intensity) per cake creation. |
| **Scroll Story (Anatomy Explosion)** | GSAP ScrollTrigger pinned timeline. Scrubbing down vertically deconstructs the 3D cake into 4 distinct floating tiers (Sponge, Crunch, Ganache, Mirror Glaze). |
| **Build-a-Box Studio** | Interactive 4-piece Grand Tasting Box curator with flying item animations, plush jewelry-box slots, price counter, and confetti burst. |
| **"The Boutique Counter" (The Rack)** | Filterable menu (Signatures, Truffles, Cheesecakes, Pastries) with glassmorphic cards and instant WhatsApp order triggers. |
| **Vasai-Virar Delivery Heritage** | Dedicated express delivery hubs covering Vasai West/East, Virar, and Nallasopara with verified local reviews and FAQ. |
| **Procedural Audio Synthesizer** | Web Audio API sound engine generating chimes, carousel swooshes, chocolate crunches, and box-drop haptics (with mute toggle). |
| **Direct WhatsApp Ordering** | One-tap order generation pre-filling customized cake details, weights, and delivery address requests directly to WhatsApp. |

---

## 🛠 Tech Stack

- **Three.js** (WebGL 3D Rendering, Physical Materials, ACES Filmic Tone Mapping)
- **GSAP & ScrollTrigger** (Pinned scrubbed layer explosion choreography)
- **Lenis** (Buttery smooth inertia scrolling)
- **Canvas Confetti** (Celebration particle bursts)
- **Web Audio API** (Procedural tactile sound synthesizer)
- **Vite** (Next-generation lightning-fast frontend tooling)

---

## 🚀 Running Locally

1. **Install dependencies** (already installed in this directory):
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```

3. **Production Build & Preview**:
   ```bash
   npm run build
   npm run preview
   ```

Live preview is currently running at: **`http://localhost:4173/`**
