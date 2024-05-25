import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

import SplitType from "split-type";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

/**
 * Loaders
 */
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Env Maps +   3D Libs
 */
// import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise";

/**
 * Cursor
 */
import { GooCursor } from "./cursor.js";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// const rgbeLoader = new RGBELoader();
// const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();

/**
 * Environment map
 */
scene.environmentIntensity = 1;
scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;
// scene.backgroundRotation.x = 1
// scene.environmentRotation.x = 2

gui.add(scene, "environmentIntensity").min(0).max(10).step(0.001);
gui.add(scene, "backgroundBlurriness").min(0).max(1).step(0.001);
gui.add(scene, "backgroundIntensity").min(0).max(10).step(0.001);
gui
  .add(scene.backgroundRotation, "y")
  .min(0)
  .max(Math.PI * 2)
  .step(0.001)
  .name("backgroundRotationY");
gui
  .add(scene.environmentRotation, "y")
  .min(0)
  .max(Math.PI * 2)
  .step(0.001)
  .name("environmentRotationY");
gui.hide();

/**
 * Models
 */
// dracoLoader.setDecoderPath("/draco/");
// gltfLoader.setDRACOLoader(dracoLoader);

const sectionMeshes = [];
const objectsDistance = 4;
let _latexSunglasses, _latexGloves, _latexMask, _latexGlass;

gltfLoader.load("/models/Latex_Sunglasses/scene.gltf", (gltf) => {
  gltf.scene.scale.set(1.225, 1.225, 1.225);
  gltf.scene.position.x = 0.2;
  gltf.scene.position.z = 0.35;
  gltf.scene.rotation.y = Math.PI / 3.8;
  _latexSunglasses = gltf.scene;
  _latexSunglasses.position.y = -objectsDistance * 0 + 1;
  sectionMeshes.push(_latexSunglasses);
  scene.add(_latexSunglasses);
});

gltfLoader.load("/models/Latex_Gloves/scene.gltf", (gltf) => {
  gltf.scene.scale.set(4.25, 4.25, 4.25);
  gltf.scene.position.x = 0;
  gltf.scene.position.z = 1.35;
  gltf.scene.rotation.x = Math.PI * 2;
  gltf.scene.rotation.y = Math.PI / 2;
  _latexGloves = gltf.scene;
  _latexGloves.position.y = -objectsDistance * 4;
  sectionMeshes.push(_latexGloves);
  scene.add(_latexGloves);
});

gltfLoader.load("/models/Latex_Mask/scene.gltf", (gltf) => {
  gltf.scene.scale.set(2.125, 2.125, 2.125);
  gltf.scene.position.x = 2;
  gltf.scene.position.z = 2.15;
  gltf.scene.rotation.x = Math.PI / 2.4;

  _latexMask = gltf.scene;
  _latexMask.position.y = -objectsDistance * 6;
  sectionMeshes.push(_latexMask);
  scene.add(_latexMask);
});

gltfLoader.load("/models/Latex_Glass/scene.gltf", (gltf) => {
  const model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh) {
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      materials.forEach((material) => {
        if (material) {
          // Disable environment map influences
          material.envMap = null;
          material.envMapIntensity = 0;

          // Additional properties for MeshStandardMaterial and MeshPhysicalMaterial
          if (
            material.isMeshStandardMaterial ||
            material.isMeshPhysicalMaterial
          ) {
            material.reflectivity = 0; // Disable reflectivity
            material.clearcoat = 0; // Disable clearcoat
            material.clearcoatRoughness = 1; // Max roughness
          }

          // Ensure material properties are updated
          material.needsUpdate = true;
        }
      });
    }
  });

  gltf.scene.scale.set(2.225, 2.225, 2.225);
  gltf.scene.position.x = 5;
  gltf.scene.position.y = 8;
  gltf.scene.position.z = 3.15;
  gltf.scene.rotation.x = Math.PI / 1.2;

  _latexGlass = gltf.scene;
  _latexGlass.position.y = -objectsDistance * 10;
  sectionMeshes.push(_latexGlass);
  scene.add(_latexGlass);
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 7.4);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight("pink", 4);
directionalLight1.position.set(1, 1, 1).normalize();
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight("pink", 4);
directionalLight2.position.set(-1, -1, -1).normalize();
scene.add(directionalLight2);

const pointLight1 = new THREE.PointLight(0xffffff, 4.5);
pointLight1.position.set(2, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight("pink", 4.5);
pointLight2.position.set(-2, -2, -2);
scene.add(pointLight2);

const spotlight = new THREE.SpotLight(0xffffff, 4);
spotlight.position.set(0, 5, 0);
spotlight.angle = Math.PI / 6;
scene.add(spotlight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, -2, 2.5);
cameraGroup.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = false;
controls.enabled = false;
camera.lookAt(controls.target);

// Fog
scene.fog = new THREE.Fog("rgb(28, 28, 28)", 1.3, 2.1);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  // powerPreference: "high-performance",
});
renderer.setClearColor("rgb(28, 28, 28)");
renderer.shadowMap.enabled = false;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Ground projected skybox
// rgbeLoader.load("/environmentMaps/0/2k.hdr", (environmentMap) => {
// environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// environmentMap.magFilter = THREE.LinearFilter; // Optional: adjusts filtering
// environmentMap.minFilter = THREE.LinearMipmapLinearFilter; // Optional: adjusts filtering
// scene.environment = environmentMap;
// environmentMap.dispose();
// });

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/textures/particles/5.png");

/**
 * Particles
 */
// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32);
const particlesGeometry = new THREE.BufferGeometry();
const count = 1000;
const positions = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 4;
}
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,
});
// particlesMaterial.map = particleTexture;
particlesMaterial.vertexColors = true;
particlesMaterial.transparent = false;
particlesMaterial.alphaMap = particleTexture;
// particlesMaterial.alphaTest = 0.001;
// particlesMaterial.depthTest = false;
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;

/**
 * Points
 */
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
const noise = new SimplexNoise();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Model animation
  if (_latexSunglasses) {
    const dynamicRandomOffsetX = noise.noise3d(elapsedTime, 0, 0) * 0.15;
    const dynamicRandomOffsetY = noise.noise3d(0, elapsedTime, 0) * 0.05;
    _latexSunglasses.rotation.x =
      Math.cos(elapsedTime * 4) * 0.04 + dynamicRandomOffsetX;
    _latexSunglasses.rotation.y =
      Math.cos(elapsedTime * 4) * 0.2 + dynamicRandomOffsetY + Math.PI * 0.2;
  }

  if (_latexMask) {
  }

  if (_latexGloves) {
  }

  if (_latexGlass) {
    const dynamicRandomOffsetX = noise.noise3d(elapsedTime, 0, 0) * 0.05;
    _latexGlass.rotation.x =
      Math.cos(elapsedTime * 2) * 0.04 + dynamicRandomOffsetX;
  }

  // Animate Camera
  // camera.position.y = (-scrollY / sizes.height) * objectsDistance;
  const parallaxX = cursor.x * 0.5;
  const parallaxY = cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Use GSAP to animate the camera position smoothly
  gsap.to(camera.position, {
    y: (-scrollY / sizes.height) * objectsDistance,
    duration: 4,
    ease: "power2.out",
  });

  // Raycast
  raycaster.setFromCamera(cursor, camera);
  const intersects = raycaster.intersectObject(camera);
  if (intersects.length > 0) {
    // Make the model look at the intersection point
    const point = intersects[0].point;
    _latexSunglasses.lookAt(point);
  }

  // Update controls
  // controls.update();
  camera.lookAt(controls.target);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
tick();

/**
 * Sound
 */
let audioEl, audioUx;
document.addEventListener("DOMContentLoaded", (event) => {
  audioEl = new Audio("/sound/grips.mp3");
  audioUx = new Audio("/sound/hud.mp3");
  audioEl.play();
  audioEl.volume = 0.25;
  audioEl.loop = true;
});

document.querySelectorAll(".text-hover-effect").forEach((el) => {
  el.addEventListener("mouseover", () => {
    audioUx.pause();
    audioUx.play();
    audioUx.volume = 0.8;
    const fadeOut = () => {
      if (audioUx.volume > 0) {
        // only if we're not yet at 0
        setTimeout(function () {
          if (audioUx.volume > 0.2) audioUx.volume -= 0.2;
          fadeOut(audioUx); // do it again after one second
        }, 1000);
      }
    };
    fadeOut();
  });
});

/**
 * Text Hover Effect
 */
// Characters to cycle trough
let allowedCharacters = ["X", "$", "Y", "#", "?", "*", "0", "1", "+"];

// Function to return random character
function getRandomCharacter() {
  const randomIndex = Math.floor(Math.random() * allowedCharacters.length);
  return allowedCharacters[randomIndex];
}

// ⚙️ Event handler// 🏭 Creates new event handler with a private variable
function createEventHandler() {
  // 🏃‍♂️ Private variable: Keep track of the event in progress
  let isInProgress = false;

  // 👇 Event handler implementation
  return function handleHoverEvent(e) {
    if (isInProgress) {
      return;
    }

    const text = e.target.innerHTML;
    const randomizedText = text.split("").map(getRandomCharacter).join("");

    for (let i = 0; i < text.length; i++) {
      isInProgress = true;

      setTimeout(() => {
        const nextIndex = i + 1;
        e.target.innerHTML = `${text.substring(
          0,
          nextIndex
        )}${randomizedText.substring(nextIndex)}`;

        if (nextIndex === text.length) {
          isInProgress = false;
        }
      }, i * 30);
    }
  };
}

// Attach an event listener to elements
document.querySelectorAll(".text-hover-effect").forEach((element) => {
  const eventHandler = createEventHandler();
  element.addEventListener("mouseover", eventHandler);
});

/**
 * Cursor
 */
const cursorEl = document.querySelector(".cursor");

// Initialize cursor
const goo = new GooCursor(cursorEl);

// Easter egg: click anywhere

window.addEventListener("click", () => {
  gsap
    .timeline()
    .addLabel("start", 0)
    .to(
      goo.DOM.cells,
      {
        duration: 1,
        ease: "power4",
        opacity: 1,
        stagger: {
          from: [...goo.DOM.cells].indexOf(goo.getCellAtCursor()),
          each: 0.02,
          grid: [goo.rows, goo.columns],
        },
      },
      "start"
    )
    .to(
      goo.DOM.cells,
      {
        duration: 1,
        ease: "power1",
        opacity: 0,
        stagger: {
          from: [...goo.DOM.cells].indexOf(goo.getCellAtCursor()),
          each: 0.03,
          grid: [goo.rows, goo.columns],
        },
      },
      "start+=0.3"
    );
});

document.getElementById("content").click();
window.setInterval(function () {
  document.getElementById("content").click();
}, 10000);

/**
 * Text Animation
 */
document.addEventListener("DOMContentLoaded", () => {
  // Ensure GSAP and ScrollTrigger are loaded
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".parallax-bg").forEach((element) => {
    gsap.to(element, {
      y: (i, target) => {
        return (1 - target.dataset.speed) * 100;
      },
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom", // when the top of the element hits the bottom of the viewport
        end: "bottom top", // when the bottom of the element hits the top of the viewport
        scrub: true,
      },
    });
  });

  // Initialize SplitType for all text elements
  document.querySelectorAll(".word").forEach((textElement) => {
    const splitText = new SplitType(textElement, { types: "words" });

    // Ensure SplitType has processed the text before animating
    setTimeout(() => {
      // Animate each word on scroll with more explicit effects
      gsap.from(splitText.words, {
        scrollTrigger: {
          trigger: textElement,
          start: "top bottom", // Trigger animation when the text is centered in the viewport
          end: "bottom center", // End animation when the text is centered at the bottom of the viewport
          scrub: true, // Smoothly animate with the scroll
          toggleActions: "play none none none", // Automatically end the animation when it exits the viewport
          markers: false, // Uncomment this line to see the ScrollTrigger markers for debugging
        },
        opacity: 0,
        y: 50,
        scale: 0.5,
        color: "#ff0000", // Change color to red
        stagger: 0.1,
        duration: 4, // Longer duration to ensure animations complete
        ease: "power2.out",
      });
    }, 100); // Delay to ensure SplitType has time to split the text
  });

  ScrollTrigger.create({
    trigger: ".content",
    start: "-0.1% top",
    end: "bottom bottom",
    onEnter: () => {
      gsap.set(".content", { position: "absolute", top: "195%" });
    },
    onLeaveBack: () => {
      gsap.set(".content", { position: "fixed", top: "0" });
    },
  });

  gsap.to(".section--one .letters:first-child", {
    x: () => -innerWidth * 3,
    scale: 10,
    ease: "power2.inOut",
    scrollTrigger: {
      start: "top top",
      end: "+=200%",
      scrub: 1,
    },
  });

  gsap.to(".section--one .letters:last-child", {
    x: () => innerWidth * 3,
    scale: 10,
    ease: "power2.inOut",
    scrollTrigger: {
      start: "top top",
      end: "+=200%",
      scrub: 1,
    },
  });
});
