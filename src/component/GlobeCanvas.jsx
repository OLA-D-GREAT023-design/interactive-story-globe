import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import storiesData from '../data/stories.json';
import { latLngToVector3 } from '../utils/latLngToVector3';

import earthTexture from '../assets/earth.jpg';

export default function GlobeCanvas({ onPinClick, theme }) {
  const refContainer = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const controlsRef = useRef();
  const globeRef = useRef();
  const sceneRef = useRef();
  const [hovered, setHovered] = useState(null);
  const animationRef = useRef();

  useEffect(() => {
    const container = refContainer.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.5);
    cameraRef.current = camera;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Globe
    const globe = new ThreeGlobe({ animateIn: true })
      .globeImageUrl(earthTexture)
      .bumpImageUrl(null)
      .showAtmosphere(true)
      .atmosphereColor(theme === 'Sci-Fi' ? '#0ea5e9' : '#2a6f97')
      .atmosphereAltitude(0.25);

    globeRef.current = globe;
    scene.add(globe);

    // Points layer: convert storiesData to pointsData
    const points = storiesData.map((s, idx) => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      size: 0.6,
      color:
        theme === 'Historical'
          ? 'orange'
          : theme === 'Sci-Fi'
          ? 'cyan'
          : 'magenta',
      ...s
    }));

    globe
      .pointsData(points)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointAltitude(0.01)
      .pointRadius(0.05)
      .pointsTransitionDuration(300);

    // Event handlers (raycast)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onPointerMove(ev) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function getIntersectedPoint() {
      raycaster.setFromCamera(mouse, camera);
      // three-globe stores points in globe.__points
      const pointsObjects =
        globe.__points && globe.__points.children ? globe.__points.children : [];
      const intersects = raycaster.intersectObjects(pointsObjects, true);
      return intersects.length ? intersects[0] : null;
    }

    function onPointerClick(ev) {
      onPointerMove(ev);
      const hit = getIntersectedPoint();
      if (hit) {
        const obj = hit.object;
        // traverse upwards to find point object with userData (three-globe attaches __data)
        let parent = obj;
        while (parent && !parent.__data) parent = parent.parent;
        if (parent && parent.__data) {
          onPinClick && onPinClick(parent.__data);
          // camera fly to pin (GSAP)
          const { x, y, z } = latLngToVector3(parent.__data.lat, parent.__data.lng, 3.2);
          gsap.to(camera.position, { x, y, z, duration: 1.2, ease: 'power2.inOut' });
        }
      }
    }

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onPointerClick);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Resize
    function handleResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', handleResize);

    // Animation loop
    function animate() {
      controls.update();
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    }
    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationRef.current);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onPointerClick);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      container.removeChild(renderer.domElement);
    };
  }, []); // initial mount only

  // React to theme changes (swap atmosphere color and point colors)
  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current;
    // adjust atmosphere
    const atmColor =
      theme === 'Sci-Fi' ? '#0ea5e9' : theme === 'Historical' ? '#b87d3c' : '#8b5cf6';
    globe.atmosphereColor(atmColor);
    // recolor points
    const points = globe.pointsData() || [];
    const recolored = points.map((p) => ({
      ...p,
      color:
        theme === 'Historical' ? 'orange' : theme === 'Sci-Fi' ? 'cyan' : 'magenta'
    }));
    globe.pointsData(recolored);
  }, [theme]);

  return (
    <div
      ref={refContainer}
      className="w-full h-full min-h-[60vh] rounded-lg overflow-hidden"
      aria-label="Interactive 3D globe. Drag to rotate, scroll to zoom."
    />
  );
}
