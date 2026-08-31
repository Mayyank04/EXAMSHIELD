import * as THREE from 'three';
import { disposeThreeScene, prefersReducedMotion } from './threeUtils.ts';

export interface VaultNodeData {
  id: string;
  label: string;
  type: 'VAULT' | 'PAPER' | 'TRANSPORT' | 'IOT' | 'INCIDENT';
  status: string;
  securityScore: number;
  details: string;
}

export class VaultNetworkScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private isVisible: boolean = true;

  private nodesGroup!: THREE.Group;
  private connectionsGroup!: THREE.Group;
  private interactiveMeshes: THREE.Mesh[] = [];
  private nodeDataMap = new Map<string, VaultNodeData>();

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-999, -999);
  private hoveredMesh: THREE.Mesh | null = null;
  private onNodeSelectCallback?: (node: VaultNodeData) => void;

  private boundOnMouseMove!: (e: MouseEvent) => void;
  private boundOnClick!: (e: MouseEvent) => void;
  private boundOnResize!: () => void;
  private boundOnVisibilityChange!: () => void;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, onNodeSelect?: (node: VaultNodeData) => void) {
    this.container = container;
    this.onNodeSelectCallback = onNodeSelect;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 550;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0b0f19, 0.04);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 4, 12);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const purplePoint = new THREE.PointLight(0xa855f7, 3, 25);
    purplePoint.position.set(-6, -2, 4);
    this.scene.add(purplePoint);

    this.nodesGroup = new THREE.Group();
    this.connectionsGroup = new THREE.Group();
    this.scene.add(this.connectionsGroup);
    this.scene.add(this.nodesGroup);

    // Build Vault Infrastructure Nodes
    this.buildNetworkNodes();

    // Event Listeners
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnClick = this.onClick.bind(this);
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnVisibilityChange = this.onVisibilityChange.bind(this);

    this.container.addEventListener('mousemove', this.boundOnMouseMove);
    this.container.addEventListener('click', this.boundOnClick);
    window.addEventListener('resize', this.boundOnResize);
    document.addEventListener('visibilitychange', this.boundOnVisibilityChange);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    this.animate();
  }

  private buildNetworkNodes() {
    // 1. Central Sovereign Vault Core
    this.createNode(
      {
        id: 'CORE-VAULT-01',
        label: 'Central Sovereign Examination Directorate Vault',
        type: 'VAULT',
        status: 'PROTECTED',
        securityScore: 99,
        details: 'Hardware Security Module Cluster & Root Key Authority (FIPS 140-3 Level 4)',
      },
      new THREE.Vector3(0, 0, 0),
      0x3b82f6,
      1.1
    );

    // 2. Question Paper Repositories
    const papers: VaultNodeData[] = [
      { id: 'PAP-001', label: 'NEET-2027-PHY-A', type: 'PAPER', status: 'APPROVED', securityScore: 98, details: '180 Questions | SHA-256 Verified' },
      { id: 'PAP-002', label: 'NEET-2027-PHY-B', type: 'PAPER', status: 'SEALED_RESERVE', securityScore: 100, details: 'Reserve Contingency Set B' },
      { id: 'PAP-003', label: 'JEE-2027-MAT-A', type: 'PAPER', status: 'DISPATCHED', securityScore: 96, details: 'Advanced Mathematics Paper' },
      { id: 'PAP-004', label: 'NEET-2027-CHE-A', type: 'PAPER', status: 'APPROVED', securityScore: 99, details: 'Chemistry Paper Set A' },
    ];

    papers.forEach((p, idx) => {
      const angle = (idx / papers.length) * Math.PI * 2;
      const radius = 3.8;
      const pos = new THREE.Vector3(Math.cos(angle) * radius, 0.6 * (idx % 2 === 0 ? 1 : -1), Math.sin(angle) * radius);
      this.createNode(p, pos, 0x8b5cf6, 0.55);
      this.createConnectionLine(new THREE.Vector3(0, 0, 0), pos, 0x8b5cf6);
    });

    // 3. Armored Transport Carrier Nodes
    const transports: VaultNodeData[] = [
      { id: 'TRP-01', label: 'Armored Carrier DL-1VB-9921', type: 'TRANSPORT', status: 'IN_TRANSIT', securityScore: 94, details: 'Corridor: Delhi -> Noida (Speed: 52 km/h)' },
      { id: 'TRP-02', label: 'Armored Carrier UP-16-AX-4410', type: 'TRANSPORT', status: 'ON_SCHEDULE', securityScore: 97, details: 'Corridor: Greater Noida Express' },
      { id: 'TRP-03', label: 'Armored Carrier DL-4C-8812', type: 'TRANSPORT', status: 'IN_STORAGE', securityScore: 100, details: 'Standby Escort Unit' },
    ];

    transports.forEach((t, idx) => {
      const angle = ((idx + 0.5) / transports.length) * Math.PI * 2;
      const radius = 6.2;
      const pos = new THREE.Vector3(Math.cos(angle) * radius, 1.2 * (idx % 2 === 0 ? -1 : 1), Math.sin(angle) * radius);
      this.createNode(t, pos, 0x10b981, 0.6);
      this.createConnectionLine(new THREE.Vector3(0, 0, 0), pos, 0x10b981);
    });

    // 4. Incident / Threat Flag Beacon
    const incident: VaultNodeData = {
      id: 'INC-8819',
      label: 'Tamper Sensor Alert ES-PKG-82931',
      type: 'INCIDENT',
      status: 'UNDER_INVESTIGATION',
      securityScore: 45,
      details: 'Physical Reed Switch Interrupt & Corridor Departure',
    };
    const incPos = new THREE.Vector3(4.8, 2.2, -2.5);
    this.createNode(incident, incPos, 0xef4444, 0.65);
    this.createConnectionLine(new THREE.Vector3(0, 0, 0), incPos, 0xef4444);
  }

  private createNode(data: VaultNodeData, position: THREE.Vector3, colorHex: number, scale: number) {
    const geo = data.type === 'VAULT'
      ? new THREE.DodecahedronGeometry(scale)
      : data.type === 'INCIDENT'
      ? new THREE.OctahedronGeometry(scale)
      : new THREE.IcosahedronGeometry(scale);

    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: data.type === 'INCIDENT' ? 0.9 : 0.4,
      metalness: 0.7,
      roughness: 0.2,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.userData = { nodeId: data.id };

    // Outer wireframe halo
    const wireGeo = new THREE.IcosahedronGeometry(scale * 1.12);
    const wireMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    mesh.add(wireMesh);

    this.nodesGroup.add(mesh);
    this.interactiveMeshes.push(mesh);
    this.nodeDataMap.set(data.id, data);
  }

  private createConnectionLine(p1: THREE.Vector3, p2: THREE.Vector3, colorHex: number) {
    const points = [p1, p2];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.3,
    });
    const line = new THREE.Line(geo, mat);
    this.connectionsGroup.add(line);
  }

  private onMouseMove(e: MouseEvent) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

    if (intersects.length > 0) {
      const topMesh = intersects[0].object as THREE.Mesh;
      if (this.hoveredMesh !== topMesh) {
        if (this.hoveredMesh) this.resetMeshHighlight(this.hoveredMesh);
        this.hoveredMesh = topMesh;
        this.highlightMesh(this.hoveredMesh);
        this.container.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredMesh) {
        this.resetMeshHighlight(this.hoveredMesh);
        this.hoveredMesh = null;
        this.container.style.cursor = 'default';
      }
    }
  }

  private highlightMesh(mesh: THREE.Mesh) {
    mesh.scale.set(1.2, 1.2, 1.2);
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.0;
  }

  private resetMeshHighlight(mesh: THREE.Mesh) {
    mesh.scale.set(1.0, 1.0, 1.0);
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4;
  }

  private onClick(e: MouseEvent) {
    if (!this.hoveredMesh) return;
    const nodeId = this.hoveredMesh.userData.nodeId;
    const data = this.nodeDataMap.get(nodeId);
    if (data && this.onNodeSelectCallback) {
      this.onNodeSelectCallback(data);
    }
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

    // Slow orbital rotation of vault network
    this.nodesGroup.rotation.y += 0.002 * slowMotion;
    this.connectionsGroup.rotation.y += 0.002 * slowMotion;

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    this.container.removeEventListener('mousemove', this.boundOnMouseMove);
    this.container.removeEventListener('click', this.boundOnClick);
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
