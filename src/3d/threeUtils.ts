import * as THREE from 'three';

/**
 * Checks if the current client device / browser supports WebGL 1/2 rendering.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Checks if user has requested reduced motion preferences.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Safely disposes of all geometries, materials, and textures within a Three.js scene/group
 * to prevent WebGL context memory leaks.
 */
export function disposeThreeScene(scene: THREE.Scene | THREE.Group | THREE.Object3D) {
  scene.traverse((object: any) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => {
          disposeMaterial(mat);
        });
      } else {
        disposeMaterial(object.material);
      }
    }
  });
}

function disposeMaterial(material: any) {
  if (!material) return;
  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      value.dispose();
    }
  }
  material.dispose();
}
