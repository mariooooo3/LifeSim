import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export interface GlobePin {
  id: string;
  lat: number;
  lng: number;
  dim?: boolean;
  highlighted?: boolean;
}

interface Props {
  pins: GlobePin[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

const EARTH_TEX = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_SPEC = "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg";
const EARTH_NORMAL = "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg";
const CLOUD_TEX = "https://threejs.org/examples/textures/planets/earth_clouds_1024.png";

export function CinematicGlobe({ pins, selectedId, onSelect, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  const pinsRef = useRef(pins);
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);
  pinsRef.current = pins;
  onSelectRef.current = onSelect;

  const flyToSelectedRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedId && selectedId !== selectedIdRef.current) {
      flyToSelectedRef.current = selectedId;
    }
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;

    const cityList = pinsRef.current;
    const cityIds = cityList.map((p) => p.id);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 2000);
    camera.position.set(0, 0.5, 5.8);

    const sun = new THREE.DirectionalLight(0xfff1d6, 1.6);
    sun.position.set(-5, 2, 4);
    scene.add(sun);

    const backFill = new THREE.DirectionalLight(0xffd9b0, 0.9);
    backFill.position.set(5, -1, -4);
    scene.add(backFill);

    const sideFill = new THREE.DirectionalLight(0x8fb6ff, 0.5);
    sideFill.position.set(4, 3, 2);
    scene.add(sideFill);

    scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x6a4a2a, 0.8));
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const bgGeo = new THREE.SphereGeometry(900, 32, 32);
    const bgMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying vec3 vPos;
        void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: `
        varying vec3 vPos;
        float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
        float noise(vec3 p){
          vec3 i=floor(p); vec3 f=fract(p);
          f=f*f*(3.0-2.0*f);
          float n=mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                         mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                     mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                         mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
          return n;
        }
        void main(){
          vec3 dir = normalize(vPos);
          float y = dir.y*0.5+0.5;
          vec3 top = vec3(0.012, 0.018, 0.045);
          vec3 mid = vec3(0.04, 0.03, 0.08);
          vec3 bot = vec3(0.08, 0.05, 0.12);
          vec3 col = mix(bot, mid, smoothstep(0.0,0.5,y));
          col = mix(col, top, smoothstep(0.5,1.0,y));
          float n = noise(dir*3.0)*0.6 + noise(dir*7.0)*0.3;
          col += vec3(0.18,0.10,0.22) * pow(n, 3.0) * 0.6;
          col += vec3(0.10,0.18,0.35) * pow(noise(dir*5.0+2.0), 4.0) * 0.5;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    scene.add(new THREE.Mesh(bgGeo, bgMat));

    const starGeo = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const rad = 600 + Math.random() * 200;
      const s = Math.sqrt(1 - u * u);
      starPos[i * 3] = rad * s * Math.cos(t);
      starPos[i * 3 + 1] = rad * u;
      starPos[i * 3 + 2] = rad * s * Math.sin(t);
      const tint = 0.7 + Math.random() * 0.3;
      const warm = Math.random() < 0.3;
      starCol[i * 3] = warm ? tint : tint * 0.85;
      starCol[i * 3 + 1] = tint * 0.9;
      starCol[i * 3 + 2] = warm ? tint * 0.75 : tint;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.4,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const earthDay = loader.load(EARTH_TEX);
    earthDay.colorSpace = THREE.SRGBColorSpace;
    const earthSpec = loader.load(EARTH_SPEC);
    const earthNormal = loader.load(EARTH_NORMAL);
    const cloudTex = loader.load(CLOUD_TEX);

    const EARTH_R = 1;
    const earthGeo = new THREE.SphereGeometry(EARTH_R, 96, 96);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthDay,
      specularMap: earthSpec,
      normalMap: earthNormal,
      normalScale: new THREE.Vector2(0.6, 0.6),
      specular: new THREE.Color(0x335577),
      shininess: 18,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);

    earth.rotation.y = 2.5;
    scene.add(earth);

    const cloudGeo = new THREE.SphereGeometry(EARTH_R * 1.012, 96, 96);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earth.add(clouds);

    const atmGeo = new THREE.SphereGeometry(EARTH_R * 1.18, 96, 96);
    const atmMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uSun: { value: new THREE.Vector3().copy(sun.position).normalize() },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position,1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        uniform vec3 uSun;
        void main(){
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float intensity = pow(0.72 - dot(vNormal, viewDir), 2.4);
          float sunDot = clamp(dot(normalize(vWorldPos), uSun), -1.0, 1.0);
          vec3 cool = vec3(0.30, 0.55, 1.0);
          vec3 warm = vec3(1.0, 0.65, 0.35);
          vec3 col = mix(cool, warm, smoothstep(-0.2, 0.4, sunDot)*0.65);
          gl_FragColor = vec4(col * intensity, intensity);
        }
      `,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    const cityGeo = new THREE.BufferGeometry();
    const cityPos = new Float32Array(cityList.length * 3);
    const citySize = new Float32Array(cityList.length);
    const cityWeight = new Float32Array(cityList.length);
    cityList.forEach((c, i) => {
      const v = latLonToVec3(c.lat, c.lng, EARTH_R * 1.005);
      cityPos[i * 3] = v.x;
      cityPos[i * 3 + 1] = v.y;
      cityPos[i * 3 + 2] = v.z;

      const w = c.highlighted ? 0.95 : c.dim ? 0.5 : 0.68;
      citySize[i] = 6 + w * 22;
      cityWeight[i] = w;
    });
    cityGeo.setAttribute("position", new THREE.BufferAttribute(cityPos, 3));
    cityGeo.setAttribute("aSize", new THREE.BufferAttribute(citySize, 1));
    cityGeo.setAttribute("aWeight", new THREE.BufferAttribute(cityWeight, 1));

    const ptCanvas = document.createElement("canvas");
    ptCanvas.width = ptCanvas.height = 64;
    const ctx = ptCanvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,230,170,1)");
    grad.addColorStop(0.25, "rgba(255,180,90,0.7)");
    grad.addColorStop(0.6, "rgba(255,120,40,0.15)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const ptTex = new THREE.CanvasTexture(ptCanvas);

    const cityMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTex: { value: ptTex },
        uTime: { value: 0 },
        uCamPos: { value: new THREE.Vector3() },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aWeight;
        varying float vWeight;
        varying float vFacing;
        uniform vec3 uCamPos;
        void main(){
          vec4 wp = modelMatrix * vec4(position,1.0);
          vec3 nrm = normalize(wp.xyz);
          vec3 toCam = normalize(uCamPos - wp.xyz);
          vFacing = clamp(dot(nrm, toCam), 0.0, 1.0);
          vWeight = aWeight;
          vec4 mv = viewMatrix * wp;
          gl_Position = projectionMatrix * mv;
          float dist = -mv.z;
          gl_PointSize = aSize * (3.5 / dist);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTex;
        uniform float uTime;
        varying float vWeight;
        varying float vFacing;
        void main(){
          vec4 t = texture2D(uTex, gl_PointCoord);
          float pulse = 0.78 + 0.22 * sin(uTime*1.6 + vWeight*12.0);
          float facing = smoothstep(0.02, 0.25, vFacing);
          gl_FragColor = t * vec4(1.0,0.85,0.55,1.0) * pulse * facing * (0.6 + vWeight*0.8);
        }
      `,
    });
    const cityPoints = new THREE.Points(cityGeo, cityMat);
    earth.add(cityPoints);

    type Fly = {
      active: boolean;
      t: number;
      dur: number;
      fromPos: THREE.Vector3;
      toPos: THREE.Vector3;
      fromTarget: THREE.Vector3;
      toTarget: THREE.Vector3;
    };
    const fly: Fly = {
      active: false,
      t: 0,
      dur: 1.6,
      fromPos: new THREE.Vector3(),
      toPos: new THREE.Vector3(),
      fromTarget: new THREE.Vector3(),
      toTarget: new THREE.Vector3(),
    };
    const easeInOutCubic = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    const startFlyTo = (targetWorld: THREE.Vector3) => {
      userInteracting = true;
      controls.autoRotate = false;
      const outward = targetWorld.clone().normalize();
      const camTarget = outward.multiplyScalar(2.6);
      fly.active = true;
      fly.t = 0;
      fly.dur = 1.6;
      fly.fromPos.copy(camera.position);
      fly.toPos.copy(camTarget);
      fly.fromTarget.copy(controls.target);
      fly.toTarget.copy(targetWorld);
      controls.enabled = false;
    };

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.035 };
    const ndc = new THREE.Vector2();

    let downX = 0;
    let downY = 0;
    let downT = 0;
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      downT = performance.now();
    };
    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      const dt = performance.now() - downT;
      if (Math.hypot(dx, dy) > 5 || dt > 350) return; 

      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);

      const hits = raycaster.intersectObject(cityPoints, false);
      const camDir = camera.position.clone().normalize();
      for (const h of hits) {
        const worldPos = h.point.clone();
        const n = worldPos.clone().applyMatrix4(earth.matrixWorld.clone().invert()).normalize();
        const worldN = n.clone().transformDirection(earth.matrixWorld);
        if (worldN.dot(camDir) > 0.05) {
          if (typeof h.index === "number" && cityIds[h.index]) {
            onSelectRef.current(cityIds[h.index]);
          }
          startFlyTo(worldPos);
          break;
        }
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.style.cursor = "grab";

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;   
    controls.rotateSpeed = 0.55;     
    controls.zoomSpeed = 0.7;
    controls.enablePan = false;
    controls.minDistance = 1.25;
    controls.maxDistance = 8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.38;

    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI - 0.25;

    let userInteracting = false;
    let lastInteractAt = 0;
    const RESUME_AFTER = 3.5;
    const pauseAuto = () => {
      userInteracting = true;
      controls.autoRotate = false;
      lastInteractAt = performance.now();
    };
    const onPointerMoveMaybeDrag = (e: PointerEvent) => {
      if (e.buttons === 0) return;
      pauseAuto();
    };
    renderer.domElement.addEventListener("pointermove", onPointerMoveMaybeDrag);
    renderer.domElement.addEventListener("wheel", pauseAuto, { passive: true });

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const dt = clock.getDelta();
      const t = clock.elapsedTime;
      clouds.rotation.y += dt * 0.008;
      cityMat.uniforms.uTime.value = t;
      cityMat.uniforms.uCamPos.value.copy(camera.position);

      const flyId = flyToSelectedRef.current;
      if (flyId) {
        flyToSelectedRef.current = null;
        const idx = cityIds.indexOf(flyId);
        if (idx >= 0) {
          const p = cityList[idx];
          const surface = latLonToVec3(p.lat, p.lng, EARTH_R);

          surface.applyMatrix4(earth.matrixWorld);
          startFlyTo(surface);
        }
      }

      if (userInteracting && !fly.active &&
          (performance.now() - lastInteractAt) / 1000 > RESUME_AFTER) {
        userInteracting = false;
        controls.autoRotate = true;
      }

      if (fly.active) {
        fly.t += dt;
        const k = Math.min(fly.t / fly.dur, 1);
        const e = easeInOutCubic(k);
        camera.position.lerpVectors(fly.fromPos, fly.toPos, e);
        controls.target.lerpVectors(fly.fromTarget, fly.toTarget, e);
        if (k >= 1) {
          fly.active = false;
          controls.enabled = true;
        }
      }
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMoveMaybeDrag);
      renderer.domElement.removeEventListener("wheel", pauseAuto);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmGeo.dispose();
      atmMat.dispose();
      cityGeo.dispose();
      cityMat.dispose();
      bgGeo.dispose();
      bgMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      ptTex.dispose();
      earthDay.dispose();
      earthSpec.dispose();
      earthNormal.dispose();
      cloudTex.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };

  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ touchAction: "none", cursor: "grab" }}
    />
  );
}

export default CinematicGlobe;
