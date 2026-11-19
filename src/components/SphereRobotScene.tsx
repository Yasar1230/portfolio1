import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  computeCutawaySeparation,
  computeSphereKinematics,
  dampValue,
} from '../lib/sphereKinematics';

interface SphereRobotSceneProps {
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  scrollProgressRef: React.MutableRefObject<number>;
  className?: string;
}

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 1) {
      const shade = 112 + Math.floor(Math.sin(y * 1.7) * 18 + ((y * 37) % 24));
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, 256, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(15, 17, 21, 0.48)');
    grad.addColorStop(0.55, 'rgba(15, 17, 21, 0.18)');
    grad.addColorStop(1, 'rgba(15, 17, 21, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function SphereRobotScene({
  theme,
  reducedMotion,
  scrollProgressRef,
  className = '',
}: SphereRobotSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const angleReadoutRef = useRef<HTMLSpanElement | null>(null);
  const [cutaway, setCutaway] = useState(false);
  const [paused, setPaused] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);

  const cutawayRef = useRef(cutaway);
  const pausedRef = useRef(paused);
  const themeRef = useRef(theme);
  const reducedMotionRef = useRef(reducedMotion);
  const pointerRef = useRef({ x: 0, y: 0 });
  const resetNonceRef = useRef(0);

  useEffect(() => {
    cutawayRef.current = cutaway;
  }, [cutaway]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initialW = Math.max(container.clientWidth, 320);
    const initialH = Math.max(container.clientHeight, 320);
    renderer.setSize(initialW, initialH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D spherical robot with internal pendulum mechanism');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, initialW / initialH, 0.1, 40);
    camera.position.set(0, 0.18, 6.45);
    camera.lookAt(0, -0.22, 0);

    // Studio PBR Reflections via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Three-Point Warm/Cool Studio Rig
    const hemiLight = new THREE.HemisphereLight(0xd9e6f7, 0x2a2f3a, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1df, 2.2);
    keyLight.position.set(4.2, 5.2, 4.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    const d = 3.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xb7d1f5, 1.05);
    rimLight.position.set(-4.5, 2.2, -3.6);
    scene.add(rimLight);

    // Procedural Textures
    const brushedTex = createBrushedMetalTexture();
    brushedTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const shadowTex = createContactShadowTexture();

    // Shared Calibrated Materials (varied roughness & metalness across adjacent parts)
    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe6ebf2,
      roughness: 0.14,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.72,
      transparent: true,
      opacity: isSoftwareGl ? 0.28 : 0.94,
      ior: 1.52,
      thickness: 0.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      depthWrite: false,
      side: THREE.FrontSide,
    });

    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: 0xd0d6df,
      roughness: 0.24,
      metalness: 0.88,
      bumpMap: brushedTex,
      bumpScale: 0.014,
    });

    const darkGraphiteMaterial = new THREE.MeshStandardMaterial({
      color: 0x20252e,
      roughness: 0.62,
      metalness: 0.34,
    });

    const bronzeBearingMaterial = new THREE.MeshStandardMaterial({
      color: 0xa48867,
      roughness: 0.3,
      metalness: 0.86,
    });

    const steelFastenerMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b4250,
      roughness: 0.34,
      metalness: 0.9,
    });

    const signalOrangeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe84c1e,
      roughness: 0.4,
      metalness: 0.18,
    });

    const traceRingMaterial = new THREE.MeshStandardMaterial({
      color: 0x677285,
      roughness: 0.55,
      metalness: 0.4,
      transparent: true,
      opacity: 0.75,
    });

    // Root Assembly Group (11 distinct procedural mechanical sub-parts)
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [
      shellMaterial,
      aluminumMaterial,
      darkGraphiteMaterial,
      bronzeBearingMaterial,
      steelFastenerMaterial,
      signalOrangeMaterial,
      traceRingMaterial,
    ];

    const R = 1.24;

    // Part 1 & 2: Upper & Lower Polycarbonate Hemispherical Shells
    const upperShellGeo = new THREE.SphereGeometry(
      R,
      36,
      20,
      0,
      Math.PI * 2,
      0.08,
      Math.PI * 0.46,
    );
    const lowerShellGeo = new THREE.SphereGeometry(
      R,
      36,
      20,
      0,
      Math.PI * 2,
      Math.PI * 0.54,
      Math.PI * 0.46,
    );
    geometriesToDispose.push(upperShellGeo, lowerShellGeo);

    const upperShell = new THREE.Mesh(upperShellGeo, shellMaterial);
    upperShell.renderOrder = 10;
    const lowerShell = new THREE.Mesh(lowerShellGeo, shellMaterial);
    lowerShell.renderOrder = 10;
    robotGroup.add(upperShell, lowerShell);

    // Part 3: Machined Equatorial Aluminum Ring Flange (LatheGeometry)
    const flangePoints = [
      new THREE.Vector2(R - 0.08, -0.07),
      new THREE.Vector2(R + 0.035, -0.055),
      new THREE.Vector2(R + 0.055, -0.025),
      new THREE.Vector2(R + 0.055, 0.025),
      new THREE.Vector2(R + 0.035, 0.055),
      new THREE.Vector2(R - 0.08, 0.07),
      new THREE.Vector2(R - 0.11, 0.04),
      new THREE.Vector2(R - 0.11, -0.04),
      new THREE.Vector2(R - 0.08, -0.07),
    ];
    const flangeGeo = new THREE.LatheGeometry(flangePoints, 48);
    geometriesToDispose.push(flangeGeo);
    const equatorialFlange = new THREE.Mesh(flangeGeo, aluminumMaterial);
    equatorialFlange.castShadow = !isSoftwareGl;
    equatorialFlange.receiveShadow = true;
    robotGroup.add(equatorialFlange);

    // Part 4: 24 Precision M3 Socket-Head Cap Fasteners (InstancedMesh)
    const boltGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.06, 8);
    geometriesToDispose.push(boltGeo);
    const boltCount = 24;
    const boltsMesh = new THREE.InstancedMesh(boltGeo, steelFastenerMaterial, boltCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < boltCount; i += 1) {
      const angle = (i / boltCount) * Math.PI * 2;
      const radius = R + 0.015;
      dummy.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      dummy.rotation.set(0, -angle, Math.PI / 2);
      dummy.updateMatrix();
      boltsMesh.setMatrixAt(i, dummy.matrix);
    }
    boltsMesh.instanceMatrix.needsUpdate = true;
    boltsMesh.computeBoundingSphere();
    robotGroup.add(boltsMesh);

    // Part 5: Transverse Main Drive Shaft
    const driveShaftGroup = new THREE.Group();
    robotGroup.add(driveShaftGroup);

    const shaftGeo = new THREE.CylinderGeometry(0.062, 0.062, R * 2.04, 24);
    shaftGeo.rotateZ(Math.PI / 2);
    geometriesToDispose.push(shaftGeo);
    const mainShaft = new THREE.Mesh(shaftGeo, aluminumMaterial);
    mainShaft.castShadow = !isSoftwareGl;
    driveShaftGroup.add(mainShaft);

    // Part 6: Dual Radial Bearing Housings at Shaft Poles (LatheGeometry)
    const bearingProfile = [
      new THREE.Vector2(0.065, -0.09),
      new THREE.Vector2(0.18, -0.09),
      new THREE.Vector2(0.21, -0.05),
      new THREE.Vector2(0.21, 0.05),
      new THREE.Vector2(0.16, 0.09),
      new THREE.Vector2(0.065, 0.09),
    ];
    const bearingGeo = new THREE.LatheGeometry(bearingProfile, 24);
    bearingGeo.rotateZ(Math.PI / 2);
    geometriesToDispose.push(bearingGeo);

    const leftBearing = new THREE.Mesh(bearingGeo, bronzeBearingMaterial);
    leftBearing.position.x = -(R - 0.14);
    const rightBearing = new THREE.Mesh(bearingGeo, bronzeBearingMaterial);
    rightBearing.position.x = R - 0.14;
    robotGroup.add(leftBearing, rightBearing);

    // Part 7: Central Gimbal Yoke Frame (Beveled ExtrudeGeometry)
    const yokeShape = new THREE.Shape();
    yokeShape.moveTo(-0.34, 0.22);
    yokeShape.lineTo(0.34, 0.22);
    yokeShape.lineTo(0.34, -0.18);
    yokeShape.lineTo(0.22, -0.18);
    yokeShape.lineTo(0.22, 0.1);
    yokeShape.lineTo(-0.22, 0.1);
    yokeShape.lineTo(-0.22, -0.18);
    yokeShape.lineTo(-0.34, -0.18);
    yokeShape.closePath();

    const yokeGeo = new THREE.ExtrudeGeometry(yokeShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    yokeGeo.center();
    geometriesToDispose.push(yokeGeo);
    const gimbalYoke = new THREE.Mesh(yokeGeo, darkGraphiteMaterial);
    gimbalYoke.position.set(0, 0.05, 0);
    gimbalYoke.castShadow = !isSoftwareGl;
    robotGroup.add(gimbalYoke);

    // Part 8: Brushless Drive Motor Housing & Cooling Fin Rings
    const motorGroup = new THREE.Group();
    const statorGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.36, 24);
    statorGeo.rotateZ(Math.PI / 2);
    const finGeo = new THREE.TorusGeometry(0.22, 0.015, 8, 28);
    finGeo.rotateY(Math.PI / 2);
    geometriesToDispose.push(statorGeo, finGeo);

    const stator = new THREE.Mesh(statorGeo, darkGraphiteMaterial);
    motorGroup.add(stator);
    for (let i = -2; i <= 2; i += 1) {
      const fin = new THREE.Mesh(finGeo, aluminumMaterial);
      fin.position.x = i * 0.06;
      motorGroup.add(fin);
    }
    driveShaftGroup.add(motorGroup);

    // Part 9 & 10: Internal Pendulum Sub-Assembly (Pivot -> Tapered Rod -> Signal-Orange Counterweight Bob)
    const pendulumPivot = new THREE.Group();
    robotGroup.add(pendulumPivot);

    const pivotHubGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.26, 20);
    pivotHubGeo.rotateZ(Math.PI / 2);
    const rodProfile = [
      new THREE.Vector2(0.044, 0),
      new THREE.Vector2(0.034, -0.38),
      new THREE.Vector2(0.028, -0.7),
      new THREE.Vector2(0.055, -0.76),
    ];
    const rodGeo = new THREE.LatheGeometry(rodProfile, 20);

    const bobProfile = [
      new THREE.Vector2(0.01, -0.72),
      new THREE.Vector2(0.2, -0.74),
      new THREE.Vector2(0.28, -0.82),
      new THREE.Vector2(0.28, -0.96),
      new THREE.Vector2(0.2, -1.04),
      new THREE.Vector2(0.01, -1.06),
    ];
    const bobGeo = new THREE.LatheGeometry(bobProfile, 32);
    const bobTrimGeo = new THREE.TorusGeometry(0.282, 0.016, 12, 36);
    bobTrimGeo.rotateX(Math.PI / 2);

    geometriesToDispose.push(pivotHubGeo, rodGeo, bobGeo, bobTrimGeo);

    const pivotHub = new THREE.Mesh(pivotHubGeo, bronzeBearingMaterial);
    const pendulumRod = new THREE.Mesh(rodGeo, aluminumMaterial);
    pendulumRod.castShadow = !isSoftwareGl;

    const counterweightBob = new THREE.Mesh(bobGeo, signalOrangeMaterial);
    counterweightBob.castShadow = !isSoftwareGl;

    const bobTrim = new THREE.Mesh(bobTrimGeo, aluminumMaterial);
    bobTrim.position.y = -0.89;

    pendulumPivot.add(pivotHub, pendulumRod, counterweightBob, bobTrim);

    // Part 11: Internal Meridian Vernier Guide Rail & Motion Trace Arc
    const vernierGeo = new THREE.TorusGeometry(R - 0.13, 0.013, 10, 64);
    const motionArcPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 28; i += 1) {
      const a = -Math.PI * 0.72 + (i / 28) * Math.PI * 0.44;
      motionArcPoints.push(new THREE.Vector3(Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0));
    }
    const motionArcCurve = new THREE.CatmullRomCurve3(motionArcPoints);
    const motionArcGeo = new THREE.TubeGeometry(motionArcCurve, 32, 0.012, 8, false);
    geometriesToDispose.push(vernierGeo, motionArcGeo);

    const vernierRing = new THREE.Mesh(vernierGeo, traceRingMaterial);
    const motionArc = new THREE.Mesh(motionArcGeo, signalOrangeMaterial);
    robotGroup.add(vernierRing, motionArc);

    // Grounded Contact Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(1.55, 36);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.34,
    });
    geometriesToDispose.push(shadowGeo);
    materialsToDispose.push(shadowMat);

    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.position.y = -1.52;
    scene.add(contactShadow);

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // State variables for smooth damping (zero per-frame allocations)
    let currentYaw = 0.42;
    let currentPitch = 0.18;
    let currentPendulumZ = 0.2;
    let currentPendulumX = -0.06;
    let currentShaftSpin = 0;
    let currentCutaway = 0;
    let lastResetNonce = resetNonceRef.current;

    let elapsed = 0;
    let lastTime = performance.now();
    let frameId = 0;
    let isVisible = true;
    let disposed = false;

    const applyThemePalette = () => {
      const isDark = themeRef.current === 'dark';
      shellMaterial.color.setHex(isDark ? 0x9aa6ba : 0xe8edf4);
      aluminumMaterial.color.setHex(isDark ? 0xc2cad6 : 0xd0d6df);
      darkGraphiteMaterial.color.setHex(isDark ? 0x181c23 : 0x20252e);
      signalOrangeMaterial.color.setHex(isDark ? 0xff5a2b : 0xe84c1e);
      shadowMat.opacity = isDark ? 0.48 : 0.3;
      hemiLight.intensity = isDark ? 0.85 : 1.05;
    };

    const renderFrame = (now: number) => {
      if (disposed) return;

      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      if (resetNonceRef.current !== lastResetNonce) {
        lastResetNonce = resetNonceRef.current;
        pointerRef.current.x = 0;
        pointerRef.current.y = 0;
        elapsed = 0;
      }

      if (!pausedRef.current && !reducedMotionRef.current) {
        elapsed += dt;
      }

      applyThemePalette();

      const targets = computeSphereKinematics({
        elapsedSeconds: elapsed,
        scrollProgress: scrollProgressRef.current,
        pointerX: pointerRef.current.x,
        pointerY: pointerRef.current.y,
        reducedMotion: reducedMotionRef.current,
      });

      currentYaw = dampValue(currentYaw, targets.shellYawY, 4.5, dt);
      currentPitch = dampValue(currentPitch, targets.shellPitchX, 4.5, dt);
      currentPendulumZ = dampValue(currentPendulumZ, targets.pendulumSwingZ, 5.5, dt);
      currentPendulumX = dampValue(currentPendulumX, targets.pendulumPitchX, 5.5, dt);
      currentShaftSpin = dampValue(currentShaftSpin, targets.driveShaftSpinX, 5.0, dt);
      currentCutaway = computeCutawaySeparation(cutawayRef.current, currentCutaway, dt);

      robotGroup.rotation.set(currentPitch, currentYaw, 0);
      pendulumPivot.rotation.set(currentPendulumX, 0, currentPendulumZ);
      driveShaftGroup.rotation.x = currentShaftSpin;

      upperShell.position.y = currentCutaway;
      lowerShell.position.y = -currentCutaway;

      if (angleReadoutRef.current) {
        const deg = Math.round(((currentPendulumZ * 180) / Math.PI) * 10) / 10;
        angleReadoutRef.current.textContent = `${deg >= 0 ? '+' : ''}${deg.toFixed(1)}°`;
      }

      renderer.render(scene, camera);
    };

    const afterDraw = (cb: () => void) => {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 6);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 85);
          }
        };
        frameId = window.setTimeout(poll, 6);
      } else {
        frameId = window.setTimeout(cb, 90);
      }
    };

    const tick = () => {
      if (disposed || !isVisible) return;
      renderFrame(performance.now());
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    // Initial render immediately
    renderFrame(performance.now());
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    // Pointer tracking scoped smoothly to window
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };

    const onResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 280);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      isVisible = false;
    };

    const onContextRestored = () => {
      isVisible = true;
      lastTime = performance.now();
      tick();
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const nextVisible = Boolean(entry?.isIntersecting);
        if (nextVisible && !isVisible) {
          isVisible = true;
          lastTime = performance.now();
          tick();
        } else if (!nextVisible) {
          isVisible = false;
          cancelAnimationFrame(frameId);
          window.clearTimeout(frameId);
        }
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(container);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      brushedTex.dispose();
      shadowTex.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, [scrollProgressRef]);

  return (
    <div
      data-testid="sphere-robot-stage"
      data-cutaway={cutaway ? 'open' : 'closed'}
      data-paused={paused ? 'true' : 'false'}
      className={`relative w-full h-full min-h-[340px] sm:min-h-[420px] select-none overflow-hidden ${className}`}
    >
      {webglFailed ? (
        <div className="w-full h-full flex items-center justify-center p-8">
          <svg
            viewBox="0 0 320 320"
            className="w-full max-w-[280px] h-auto text-[#0F1115] dark:text-[#F2F4F7]"
            role="img"
            aria-label="Schematic illustration of spherical robot with internal pendulum"
          >
            <circle cx="160" cy="160" r="120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            <ellipse cx="160" cy="160" rx="120" ry="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="40" y1="160" x2="280" y2="160" stroke="currentColor" strokeWidth="2" />
            <line x1="160" y1="160" x2="188" y2="245" stroke="currentColor" strokeWidth="3" />
            <circle cx="188" cy="245" r="22" fill="#E84C1E" />
            <circle cx="160" cy="160" r="9" fill="currentColor" />
          </svg>
        </div>
      ) : (
        <div ref={mountRef} className="w-full h-full" />
      )}

      {/* Compact Collapsible Bottom Dock — crisp single-row bar (solid surface, zero backdrop-filter over WebGL) */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center max-w-[96%]">
        <button
          type="button"
          onClick={() => setControlsOpen((prev) => !prev)}
          aria-expanded={controlsOpen}
          className="px-2.5 py-0.5 text-[10px] font-mono text-[#687182] dark:text-[#7E8797] bg-[#F3F4F6] dark:bg-[#0D0F12] border border-[#D4D8E0] dark:border-[#252A34] border-b-0 hover:text-[#0F1115] dark:hover:text-[#F2F4F7] transition-colors whitespace-nowrap"
        >
          {controlsOpen ? 'Hide controls' : 'Mechanism controls'}
        </button>

        {controlsOpen && (
          <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF] dark:bg-[#14171D] border border-[#D4D8E0] dark:border-[#252A34] text-[11px] whitespace-nowrap">
            <span className="font-mono text-[#687182] dark:text-[#A1A9B8] tabular-nums pr-2 border-r border-[#D4D8E0] dark:border-[#252A34] whitespace-nowrap">
              θ <span ref={angleReadoutRef} className="text-[#0F1115] dark:text-[#F2F4F7] font-medium">+0.0°</span>
            </span>

            <button
              type="button"
              onClick={() => setCutaway((prev) => !prev)}
              aria-pressed={cutaway}
              className={`px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                cutaway
                  ? 'bg-[#E84C1E] text-white'
                  : 'bg-[#E7EAEF] dark:bg-[#1B1F27] text-[#0F1115] dark:text-[#F2F4F7] hover:bg-[#D4D8E0] dark:hover:bg-[#252A34]'
              }`}
            >
              {cutaway ? 'Close shell' : 'Cutaway'}
            </button>

            <button
              type="button"
              onClick={() => setPaused((prev) => !prev)}
              aria-pressed={paused}
              className="px-2 py-1 text-[11px] font-medium bg-[#E7EAEF] dark:bg-[#1B1F27] text-[#0F1115] dark:text-[#F2F4F7] hover:bg-[#D4D8E0] dark:hover:bg-[#252A34] transition-colors whitespace-nowrap shrink-0"
            >
              {paused ? 'Resume' : 'Pause'}
            </button>

            <button
              type="button"
              onClick={() => {
                setCutaway(false);
                setPaused(false);
                resetNonceRef.current += 1;
              }}
              className="px-1.5 py-1 text-[11px] font-medium text-[#4B5362] dark:text-[#A1A9B8] hover:text-[#0F1115] dark:hover:text-[#F2F4F7] transition-colors whitespace-nowrap shrink-0"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
