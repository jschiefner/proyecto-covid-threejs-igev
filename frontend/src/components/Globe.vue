<script setup>
import { onMounted } from "@vue/runtime-core";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let radius = 500;

var examplePolygon = [
  [-7.032, 43.544],
  [-5.854, 43.612],
  [-4.512, 43.393],
  [-3.374, 43.408],
  [-3.153, 43.353],
  [-2.786, 43.431],
  [-2.459, 43.335],
  [-2.123, 43.335],
  [-1.893, 43.345],
  [-1.786, 43.35],
  [-1.769, 43.335],
  [-1.729, 43.296],
  [-1.439, 43.258],
  [-0.725, 42.92],
  [-0.313, 42.849],
  [0.478, 42.7],
  [0.66, 42.691],
  [0.745, 42.749],
  [0.858, 42.826],
  [1.33, 42.7],
  [1.443, 42.604],
  [1.496, 42.474],
  [1.726, 42.504],
  [1.731, 42.492],
  [3.175, 42.435],
  [3.076, 41.95],
  [2.779, 41.649],
  [1.645, 41.196],
  [0.93, 40.977],
  [0.745, 40.775],
  [0.515, 40.523],
  [-0.188, 39.722],
  [-0.296, 39.377],
  [-0.038, 38.886],
  [0.144, 38.706],
  [-0.432, 38.378],
  [-0.762, 37.847],
  [-1.63, 37.375],
  [-1.786, 37.181],
  [-1.893, 37.046],
  [-2.098, 36.791],
  [-2.786, 36.764],
  [-3.129, 36.751],
  [-3.374, 36.746],
  [-3.777, 36.738],
  [-4.38, 36.699],
  [-5.252, 36.311],
  [-5.339, 36.152],
  [-5.352, 36.153],
  [-5.369, 36.155],
  [-5.423, 36.167],
  [-5.446, 36.071],
  [-5.595, 36.015],
  [-5.793, 36.082],
  [-5.907, 36.176],
  [-6.036, 36.192],
  [-6.409, 36.671],
  [-6.43, 36.737],
  [-6.346, 36.799],
  [-6.945, 37.159],
  [-7.402, 37.175],
  [-7.513, 37.526],
  [-7.446, 37.694],
  [-6.932, 38.208],
  [-7.108, 38.188],
  [-7.276, 38.454],
  [-7.203, 38.751],
  [-7.021, 39.013],
  [-7.231, 39.278],
  [-7.543, 39.663],
  [-7.011, 39.736],
  [-6.951, 40.257],
  [-6.865, 40.271],
  [-6.802, 40.529],
  [-6.93, 41.029],
  [-6.69, 41.205],
  [-6.48, 41.294],
  [-6.301, 41.592],
  [-6.637, 41.898],
  [-6.986, 41.971],
  [-7.2, 41.88],
  [-8.052, 41.821],
  [-8.165, 41.818],
  [-8.199, 42.154],
  [-8.863, 41.872],
  [-8.786, 42.334],
  [-8.727, 42.688],
  [-8.962, 42.63],
  [-9.209, 42.979],
  [-9.134, 43.081],
  [-8.99, 43.273],
  [-8.629, 43.335],
  [-8.324, 43.387],
  [-7.7, 43.735],
  [-7.601, 43.673],
  [-7.032, 43.544],
];

examplePolygon = examplePolygon.map(([lon, lat]) => {
  return { lat, lon };
});

// returns a vector that can be used on the sphere :^)
function transformToSphericalVector({ lat, lon }) {
  let spherical = {
    lat: THREE.Math.degToRad(90 - lat),
    lon: THREE.Math.degToRad(lon),
  };

  return new THREE.Vector3().setFromSphericalCoords(
    radius,
    spherical.lat,
    spherical.lon
  );
}

// for the screen size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

onMounted(() => {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
  camera.position.setScalar(700);
  let canvas = document.querySelector("canvas.webgl");
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setClearColor(0x404040);
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.zoomSpeed = 0.1

  var lineGeom = new THREE.BufferGeometry();
  lineGeom.setFromPoints(
    examplePolygon.map((element) => transformToSphericalVector(element))
  );
  var line = new THREE.Line(
    lineGeom,
    new THREE.LineBasicMaterial({ color: "yellow" })
  );
  scene.add(line);

  var texLoader = new THREE.TextureLoader();
  var tex = texLoader.load("../src/assets/8081_earthmap10k.jpeg");
  var globe = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 100, 100),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.5,
    })
  );
  globe.rotation.y = -Math.PI * 0.5;
  scene.add(globe);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

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

  const tick = () => {
    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
});
</script>

<template>
  <canvas class="webgl"></canvas>
</template>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}
canvas {
  width: 100%;
  height: 100%;
}
</style>
