import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const LightPillar = ({
  topColor = '#5227FF',
  bottomColor = '#FF9FFC',
  intensity = 1,
  rotationSpeed = 0.3,
  glowAmount = 0.002,
  pillarWidth = 3,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  pillarRotation = 25,
  interactive = false,
  mixBlendMode = 'screen',
  quality = 'high',
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || failed) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.4, 3.2);

    const geometry = new THREE.CylinderGeometry(
      pillarWidth * 0.08,
      pillarWidth * 0.28,
      pillarHeight * 4,
      64,
      1,
      true
    );

    const gradientCanvas = document.createElement('canvas');
    gradientCanvas.width = 16;
    gradientCanvas.height = 256;
    const gctx = gradientCanvas.getContext('2d');
    const grad = gctx.createLinearGradient(0, 0, 0, gradientCanvas.height);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
    const gradientTexture = new THREE.CanvasTexture(gradientCanvas);

    const material = new THREE.MeshBasicMaterial({
      map: gradientTexture,
      transparent: true,
      opacity: Math.min(1, Math.max(0.1, intensity)),
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const pillar = new THREE.Mesh(geometry, material);
    pillar.rotation.z = THREE.MathUtils.degToRad(pillarRotation);
    scene.add(pillar);

    const glowGeom = new THREE.CylinderGeometry(
      pillarWidth * 0.15,
      pillarWidth * 0.45,
      pillarHeight * 4.2,
      32,
      1,
      true
    );
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(topColor),
      transparent: true,
      opacity: Math.min(0.4, 0.15 + glowAmount * 100),
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.rotation.copy(pillar.rotation);
    scene.add(glow);

    const resize = () => {
      const { clientWidth, clientHeight } = containerRef.current || {
        clientWidth: 0,
        clientHeight: 0,
      };
      if (!clientWidth || !clientHeight) return;
      const pixelRatio =
        quality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    let rafId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      pillar.rotation.y += rotationSpeed * delta;
      glow.rotation.y += rotationSpeed * delta;
      pillar.position.y = Math.sin(time * 0.0008) * 0.08 * noiseIntensity;
      glow.position.y = pillar.position.y;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    try {
      rafId = requestAnimationFrame(animate);
    } catch (err) {
      setFailed(true);
    }

    if (interactive) {
      const onMove = (event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        pillar.rotation.x = ny * 0.3;
        pillar.rotation.y += nx * 0.01;
      };
      containerRef.current.addEventListener('mousemove', onMove);
      return () => {
        containerRef.current?.removeEventListener('mousemove', onMove);
      };
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      geometry.dispose();
      glowGeom.dispose();
      material.dispose();
      glowMat.dispose();
      gradientTexture.dispose();
      renderer.dispose();
    };
  }, [
    topColor,
    bottomColor,
    intensity,
    rotationSpeed,
    glowAmount,
    pillarWidth,
    pillarHeight,
    noiseIntensity,
    pillarRotation,
    interactive,
    quality,
    failed,
  ]);

  if (failed) {
    return (
      <div className="light-pillar-fallback">
        3D background unavailable
      </div>
    );
  }

  return (
    <div className="light-pillar-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', mixBlendMode }}
      />
    </div>
  );
};

export default LightPillar;
