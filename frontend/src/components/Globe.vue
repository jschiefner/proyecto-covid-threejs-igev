<script setup>
import { onMounted } from "@vue/runtime-core";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Create loaders and globally usable variables for data
const fileLoader = new THREE.FileLoader();
const texLoader = new THREE.TextureLoader();
let geoData, covidData;

const worldLayer = 0,
  objectLayer = 1;

// Create awaitable version of file loader
function loadJsonFile(location) {
  return new Promise((resolve, reject) => {
    fileLoader.load(
      location,
      (data) => {
        resolve(JSON.parse(data));
      },
      null,
      (event) => {
        reject(event);
      }
    );
  });
}

// for the screen size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Create the scene
var scene = new THREE.Scene();

// Create and init the camera
var camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  1,
  2000
);
camera.position.set(370, 370, -15);

// Create and init lights
let worldLight = new THREE.DirectionalLight(0xffffff);
worldLight.position.set(camera.position.x, camera.position.y, +camera.position.z);
worldLight.layers.set(worldLayer, objectLayer);
scene.add(worldLight);

let objectLight = new THREE.DirectionalLight(0xffffff);
objectLight.position.set(0, 0, 1);
objectLight.layers.set(objectLayer);
scene.add(objectLight);

let ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)


// Create globe mesh
let mapMaterial = texLoader.load("../src/assets/8081_earthmap10k.jpeg");
let earthRadius = 300;
let segments = 128;
let rings = 128;
let geometry = new THREE.SphereGeometry(earthRadius, segments, rings);
mapMaterial.wrapS = THREE.RepeatWrapping;
mapMaterial.wrapT = THREE.RepeatWrapping;
let material = new THREE.MeshPhongMaterial({
  map: mapMaterial,
  color: 0x3366aa,
});
let mesh = new THREE.Mesh(geometry, material);
mesh.layers.set(worldLayer);
scene.add(mesh);

// Variables for the extrusion object creation
let rootObject = null;

// Draw a single region
function addRegion(shapePoints, covidDataWeek) {
  let shape = new THREE.Shape(shapePoints);
  let outerRadius = 305.0;

  let shapeGeometry = shape.extrude({
    amount: outerRadius - earthRadius,
    bevelEnabled: false,
  });

  // ! Calculate how tall a region should be drawn
  let extrusion = covidDataWeek.incidence / 500;

  shapeGeometry.vertices.forEach(function (vert, index) {
    let radius;
    if (index < shapeGeometry.vertices.length / 2) {
      radius = earthRadius;
    } else {
      radius = earthRadius + extrusion;
    }
    let phi = ((90.0 - vert.y) * Math.PI) / 180.0;
    let theta = ((360.0 - vert.x) * Math.PI) / 180.0;
    vert.x = radius * Math.sin(phi) * Math.cos(theta);
    vert.y = radius * Math.cos(phi);
    vert.z = radius * Math.sin(phi) * Math.sin(theta);
  });

  // ! Calculate the Color for a region here, incidence assumed to be between 0 and 5000
  const maxIncidence = 5000;
  let incidence = parseFloat(covidDataWeek.incidence);
  incidence = incidence > maxIncidence ? maxIncidence : incidence;
  let value = (255 - Math.round((incidence / maxIncidence) * 255))
    .toString(16)
    .padStart(2, "0");
  let color = new THREE.Color(`#${value}${value}${value}`);
  // color.setHSL(Math.random(), 0.8, 0.8);

  let shapeMaterial = new THREE.MeshPhongMaterial({
    color: color,
    side: THREE.DoubleSide,
  });
  let shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
  shapeMesh.layers.set(objectLayer);
  rootObject.add(shapeMesh);
}

// Draw all regions
function addAllRegions() {
  if (rootObject) {
    scene.remove(rootObject);
  }

  rootObject = new THREE.Object3D();
  scene.add(rootObject);

  geoData.features.forEach(function (region) {
    const regionNutsCode = region.properties.NUTS_ID;
    const covidDataWeek = covidData.find((element) => {
      return element.nuts == regionNutsCode;
    });

    if (covidDataWeek) {
      // console.log(JSON.stringify({regionNutsCode, element: covidDataWeek.nuts}))
    } else {
      // console.log(`could not find for ${regionNutsCode}`)
      return;
    }

    if (region.geometry.coordinates.length === 1) {
      let shapePoints = [];
      region.geometry.coordinates[0].forEach(function (points) {
        shapePoints.push(new THREE.Vector2(points[0], points[1]));
      });
      addRegion(shapePoints, covidDataWeek);
    } else {
      region.geometry.coordinates.forEach(function (coordSet) {
        if (coordSet.length == 1) {
          let shapePoints = [];
          coordSet[0].forEach(function (points) {
            shapePoints.push(new THREE.Vector2(points[0], points[1]));
          });
          addRegion(shapePoints, covidDataWeek);
        } else {
          let shapePoints = [];
          coordSet.forEach(function (points) {
            shapePoints.push(new THREE.Vector2(points[0], points[1]));
          });
          addRegion(shapePoints, covidDataWeek);
        }
      });
    }
  });
}

onMounted(async () => {
  let canvas = document.querySelector("canvas.webgl");
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setClearColor(0x404040);
  renderer.setSize(sizes.width, sizes.height);

  // Create and init OrbitControls
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.zoomSpeed = 0.1;

  // Properly resize window when necessary
  window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
  });

  const tick = () => {
    renderer.autoClear = true;
    camera.layers.set(worldLayer);
    renderer.render(scene, camera);

    renderer.autoClear = false;
    camera.layers.set(objectLayer);
    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
  };

  geoData = await loadJsonFile(
    "../src/assets/NUTS_RG_60M_2021_4326_lvl1.geojson"
  );
  covidData = await loadJsonFile(
    "../src/assets/sample-covid-data-2022-10.json"
  );

  addAllRegions();
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
