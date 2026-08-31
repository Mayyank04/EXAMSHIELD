import * as THREE from 'three';
import { disposeThreeScene, prefersReducedMotion } from './threeUtils.ts';

export class SecurityCoreScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private isVisible: boolean = true;

  private coreMesh!: THREE.Mesh;
  private innerShieldMesh!: THREE.Mesh;
  private outerRing1!: THREE.LineLoop;
  private outerRing2!: THREE.LineLoop;
  private outerRing3!: THREE.LineLoop;
  private particlesMesh!: THREE.Points;

  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetRotationX: number = 0;
  private targetRotationY: number = 0;

  private boundOnMouseMove!: (e: MouseEvent) => void;
  private boundOnResize!: () => void;
  private boundOnVisibilityChange!: () => void;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 500;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 7.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 4, 20);
    blueLight.position.set(5, 5, 5);
    this.scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 3, 20);
    purpleLight.position.set(-5, -3, 3);
    this.scene.add(purpleLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 2, 15);
    emeraldLight.position.set(0, 5, -4);
    this.scene.add(emeraldLight);

    // 1. Central Encrypted Security Core (Octahedron/Icosahedron Glass Enclave)
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a,
      emissive: 0x0f172a,
      roughness: 0.15,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.65,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.scene.add(this.coreMesh);

    // Wireframe overlay on core
    const wireGeo = new THREE.IcosahedronGeometry(1.52, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreWireframe = new THREE.Mesh(wireGeo, wireMat);
    this.coreMesh.add(coreWireframe);

    // 2. Inner Glowing Cryptographic Kernel
    const innerGeo = new THREE.OctahedronGeometry(0.85, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
    });
    this.innerShieldMesh = new THREE.Mesh(innerGeo, innerMat);
    this.scene.add(this.innerShieldMesh);

    // 3. Concentric Cryptographic Shield Rings
    this.outerRing1 = this.createCryptoRing(2.2, 0x3b82f6, 0.7);
    this.outerRing2 = this.createCryptoRing(2.7, 0x8b5cf6, 0.5);
    this.outerRing3 = this.createCryptoRing(3.2, 0x10b981, 0.4);

    this.outerRing1.rotation.x = Math.PI / 3;
    this.outerRing2.rotation.y = Math.PI / 4;
    this.outerRing3.rotation.z = Math.PI / 6;

    this.scene.add(this.outerRing1);
    this.scene.add(this.outerRing2);
    this.scene.add(this.outerRing3);

    // 4. Orbiting Particle Network (200 particles)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Color variation (electric blue to soft violet)
      const isViolet = Math.random() > 0.6;
      colors[i * 3] = isViolet ? 0.54 : 0.23;
      colors[i * 3 + 1] = isViolet ? 0.36 : 0.51;
      colors[i * 3 + 2] = isViolet ? 0.96 : 0.96;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    this.particlesMesh = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particlesMesh);

    // Event Listeners
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnVisibilityChange = this.onVisibilityChange.bind(this);

    window.addEventListener('mousemove', this.boundOnMouseMove, { passive: true });
    window.addEventListener('resize', this.boundOnResize, { passive: true });
    document.addEventListener('visibilitychange', this.boundOnVisibilityChange);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    // Start animation loop
    this.animate();
  }

  private createCryptoRing(radius: number, colorHex: number, opacity: number): THREE.LineLoop {
    const segments = 64;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity,
      linewidth: 1,
    });
    return new THREE.LineLoop(geometry, material);
  }

  private onMouseMove(e: MouseEvent) {
    const halfX = window.innerWidth / 2;
    const halfY = window.innerHeight / 2;
    this.mouseX = (e.clientX - halfX) / halfX;
    this.mouseY = (e.clientY - halfY) / halfY;
  }

  private onResize() {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onVisibilityChange() {
    this.isVisible = document.visibilityState === 'visible';
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    if (!this.isVisible) return;

    const slowMotion = prefersReducedMotion() ? 0.2 : 1.0;

    // Smooth rotational parallax
    this.targetRotationY = this.mouseX * 0.4;
    this.targetRotationX = this.mouseY * 0.4;

    this.coreMesh.rotation.y += 0.004 * slowMotion;
    this.coreMesh.rotation.x += 0.002 * slowMotion;

    this.innerShieldMesh.rotation.y -= 0.006 * slowMotion;
    this.innerShieldMesh.rotation.z += 0.004 * slowMotion;

    this.outerRing1.rotation.z += 0.005 * slowMotion;
    this.outerRing2.rotation.x += 0.004 * slowMotion;
    this.outerRing3.rotation.y += 0.003 * slowMotion;

    this.particlesMesh.rotation.y += 0.0015 * slowMotion;

    // Camera subtle follow
    this.camera.position.x += (this.mouseX * 0.5 - this.camera.position.x) * 0.03;
    this.camera.position.y += (-this.mouseY * 0.5 - this.camera.position.y) * 0.03;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    window.removeEventListener('mousemove', this.boundOnMouseMove);
    window.removeEventListener('resize', this.boundOnResize);
    document.removeEventListener('visibilitychange', this.boundOnVisibilityChange);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.scene) {
      disposeThreeScene(this.scene);
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
