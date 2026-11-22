import * as THREE from 'three';
import { CAKE_FLAVORS } from './data.js';

export class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0.8, 6.2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.clock = new THREE.Clock();

    // State
    this.activeFlavorIndex = 0;
    this.targetActiveIndex = 0;
    this.carouselProgress = 0; // continuous value for smooth dragging
    this.targetCarouselProgress = 0;
    this.storyProgress = 0; // 0 = hero, 1 = fully exploded story

    this.cakeGroups = [];
    this.floatingParticles = null;
    this.lights = {};

    this.initLights();
    this.initCakes();
    this.initParticles();
    this.setupEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    this.scene.add(ambientLight);

    // Main Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xffecd1, 2.8);
    keyLight.position.set(4, 7, 5);
    this.scene.add(keyLight);
    this.lights.keyLight = keyLight;

    // Cool Rim Light for silhouette edge pop
    const rimLight = new THREE.DirectionalLight(0xa5c4d4, 1.8);
    rimLight.position.set(-5, 4, -4);
    this.scene.add(rimLight);
    this.lights.rimLight = rimLight;

    // Golden Accent Point Light near the hero cake
    const pointLight = new THREE.PointLight(0xffd166, 3.2, 10, 1.5);
    pointLight.position.set(0, 2.2, 2.5);
    this.scene.add(pointLight);
    this.lights.pointLight = pointLight;
  }

  createCakeMesh(flavor, index) {
    const root = new THREE.Group();
    root.userData = { flavor, index };

    // Group for layered explosion in story mode
    const layerGroup = new THREE.Group();
    root.add(layerGroup);
    root.layerGroup = layerGroup;

    // Golden Cake Platter
    const boardGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.06, 64);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.position.y = -0.55;
    layerGroup.add(boardMesh);
    root.boardMesh = boardMesh;

    // Color definitions
    const primaryHex = parseInt(flavor.primaryColor.replace('#', '0x'));
    const accentHex = parseInt(flavor.accentColor.replace('#', '0x'));

    // LAYER 4: Base Moist Sponge (Bottom)
    const baseGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.28, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      roughness: 0.7,
      metalness: 0.05
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.38;
    layerGroup.add(baseMesh);
    root.layerBase = baseMesh;

    // LAYER 3: Roasted Crunch & Praline Core
    const crunchGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.18, 48);
    const crunchMat = new THREE.MeshStandardMaterial({
      color: accentHex,
      roughness: 0.55,
      metalness: 0.25
    });
    const crunchMesh = new THREE.Mesh(crunchGeo, crunchMat);
    crunchMesh.position.y = -0.15;
    layerGroup.add(crunchMesh);
    root.layerCrunch = crunchMesh;

    // LAYER 2: Belgian Mousse / Ganache Tier
    const ganacheGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.35, 48);
    const ganacheMat = new THREE.MeshPhysicalMaterial({
      color: primaryHex,
      roughness: 0.28,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2
    });
    const ganacheMesh = new THREE.Mesh(ganacheGeo, ganacheMat);
    ganacheMesh.position.y = 0.12;
    layerGroup.add(ganacheMesh);
    root.layerGanache = ganacheMesh;

    // LAYER 1: Crown Mirror Glaze & Top Decor
    const crownGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.16, 48);
    const crownMat = new THREE.MeshPhysicalMaterial({
      color: primaryHex,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.y = 0.38;
    layerGroup.add(crownMesh);
    root.layerCrown = crownMesh;

    // Top Garnishes: Gold flakes, Berries, Macarons & Chocolate Curls
    const garnishGroup = new THREE.Group();
    crownMesh.add(garnishGroup);
    root.garnishGroup = garnishGroup;

    // 1. Center Macaron / Truffle Orb
    const macaronTopGeo = new THREE.SphereGeometry(0.24, 24, 16);
    macaronTopGeo.scale(1, 0.65, 1);
    const macaronMat = new THREE.MeshStandardMaterial({
      color: accentHex,
      roughness: 0.4
    });
    const macaronMesh = new THREE.Mesh(macaronTopGeo, macaronMat);
    macaronMesh.position.set(0, 0.18, 0);
    garnishGroup.add(macaronMesh);

    // 2. Pearls / Gold spheres ring
    const pearlGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xffdf78,
      metalness: 0.95,
      roughness: 0.15
    });
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const pearl = new THREE.Mesh(pearlGeo, pearlMat);
      pearl.position.set(Math.cos(angle) * 0.75, 0.12, Math.sin(angle) * 0.75);
      garnishGroup.add(pearl);
    }

    // 3. Berry / Truffle Accents
    const berryGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const berryMat = new THREE.MeshPhysicalMaterial({
      color: 0x9e122b,
      roughness: 0.2,
      clearcoat: 0.8
    });
    for (let b = 0; b < 3; b++) {
      const bAngle = (b / 3) * Math.PI * 2 + 0.3;
      const berry = new THREE.Mesh(berryGeo, berryMat);
      berry.position.set(Math.cos(bAngle) * 0.45, 0.16, Math.sin(bAngle) * 0.45);
      garnishGroup.add(berry);
    }

    // 4. Chocolate Shavings / Curls
    const curlGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 24, Math.PI * 1.4);
    const curlMat = new THREE.MeshStandardMaterial({
      color: 0x1f140e,
      roughness: 0.35
    });
    for (let c = 0; c < 4; c++) {
      const curl = new THREE.Mesh(curlGeo, curlMat);
      const cAngle = (c / 4) * Math.PI * 2;
      curl.position.set(Math.cos(cAngle) * 0.5, 0.16, Math.sin(cAngle) * 0.5);
      curl.rotation.x = Math.PI / 2 + Math.random() * 0.4;
      curl.rotation.z = Math.random() * Math.PI;
      garnishGroup.add(curl);
    }

    this.scene.add(root);
    return root;
  }

  initCakes() {
    this.cakeGroups = CAKE_FLAVORS.map((flavor, index) => {
      return this.createCakeMesh(flavor, index);
    });
  }

  initParticles() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const gold = new THREE.Color(0xd4af37);
    const amber = new THREE.Color(0xf4a261);
    const cream = new THREE.Color(0xfff3e3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Cylindrical cloud around cakes
      const radius = 1.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.4) * 4.5;

      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(theta) * radius;

      const pick = Math.random();
      const col = pick < 0.5 ? gold : pick < 0.8 ? amber : cream;
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      scales[i] = 0.5 + Math.random() * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.floatingParticles = new THREE.Points(geometry, material);
    this.scene.add(this.floatingParticles);
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  setActiveFlavor(index) {
    this.targetActiveIndex = index;
    this.targetCarouselProgress = index;
  }

  setCarouselProgress(val) {
    this.targetCarouselProgress = val;
  }

  setStoryProgress(val) {
    this.storyProgress = Math.max(0, Math.min(1, val));
  }

  animate() {
    requestAnimationFrame(this.animate);
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth lerp carousel
    this.carouselProgress += (this.targetCarouselProgress - this.carouselProgress) * 0.085;

    // Number of cakes
    const total = this.cakeGroups.length;
    const arcRadius = 4.2;

    this.cakeGroups.forEach((cake, idx) => {
      // Calculate wrapped shortest circular offset
      let offset = idx - this.carouselProgress;
      // Wrap offset to [-total/2, total/2]
      offset = ((offset + total / 2) % total) - total / 2;
      if (offset < -total / 2) offset += total;

      const angle = (offset / total) * Math.PI * 1.6;

      // Arc layout
      const targetX = Math.sin(angle) * arcRadius;
      const targetZ = Math.cos(angle) * arcRadius - arcRadius;
      const targetY = -Math.abs(offset) * 0.35 + 0.1;
      const targetScale = Math.max(0.4, 1.0 - Math.abs(offset) * 0.32);

      // Interpolate pose
      cake.position.x += (targetX - cake.position.x) * 0.1;
      cake.position.y += (targetY - cake.position.y) * 0.1;
      cake.position.z += (targetZ - cake.position.z) * 0.1;

      // Base rotation + gentle floating
      const rotY = -angle * 0.8 + elapsedTime * 0.25;
      cake.rotation.y = rotY;
      cake.rotation.x = 0.12 * Math.sin(elapsedTime * 0.8 + idx);

      const curScale = cake.scale.x;
      const newScale = curScale + (targetScale - curScale) * 0.1;
      cake.scale.set(newScale, newScale, newScale);

      // STORY MODE: Layer explosion when viewing active cake during story scroll
      if (Math.abs(offset) < 0.6) {
        const p = this.storyProgress;

        // Spread the 4 layers vertically
        if (cake.layerCrown) cake.layerCrown.position.y = 0.38 + p * 1.05;
        if (cake.layerGanache) cake.layerGanache.position.y = 0.12 + p * 0.45;
        if (cake.layerCrunch) cake.layerCrunch.position.y = -0.15 - p * 0.18;
        if (cake.layerBase) cake.layerBase.position.y = -0.38 - p * 0.75;
        if (cake.boardMesh) cake.boardMesh.position.y = -0.55 - p * 1.1;

        // Camera tilt / position adjustments in story mode
        if (p > 0.05) {
          cake.position.y = targetY + p * 0.5;
          cake.position.z = targetZ + p * 0.8;
          cake.rotation.x = 0.28 + p * 0.15;
          cake.rotation.y = elapsedTime * 0.4;
        }
      } else {
        // Reset layers for inactive cakes
        if (cake.layerCrown) cake.layerCrown.position.y = 0.38;
        if (cake.layerGanache) cake.layerGanache.position.y = 0.12;
        if (cake.layerCrunch) cake.layerCrunch.position.y = -0.15;
        if (cake.layerBase) cake.layerBase.position.y = -0.38;
        if (cake.boardMesh) cake.boardMesh.position.y = -0.55;
      }
    });

    // Particle subtle rotation
    if (this.floatingParticles) {
      this.floatingParticles.rotation.y = elapsedTime * 0.035;
      this.floatingParticles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;
    }

    // Dynamic point light pulse
    if (this.lights.pointLight) {
      this.lights.pointLight.intensity = 2.8 + Math.sin(elapsedTime * 2.5) * 0.4;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
