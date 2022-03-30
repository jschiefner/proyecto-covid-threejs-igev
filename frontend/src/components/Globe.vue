<script setup>
import { nextTick, onMounted, watch } from "@vue/runtime-core";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VueElement, ref } from "vue";

const props = defineProps({
  geoData: Object,
  covidData: Object,
  selectedDate: Date,
});

const emit = defineEmits(["regionSelected"]);

// Create loaders and globally usable variables for data
const texLoader = new THREE.TextureLoader();

let tooltipElement;
let tooltipString = ref("");

const offset = 700; // for the globes offset to the right, TODO: change based on window width
let rootObject = new THREE.Object3D(); // root object for the extruded elements

const worldLayer = 0,
  objectLayer = 1;

// for the screen size
const sizes = {
  width: window.innerWidth + offset,
  height: window.innerHeight,
};

// Create the scene
var scene = new THREE.Scene();

// Create and init the camera
var camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  1,
  10000
);
camera.position.set(370, 370, -15);

// Prepare Raycaster
let intersectedObject;
var rayCaster = new THREE.Raycaster();
rayCaster.layers.set(objectLayer);
let mouse = new THREE.Vector2(-1, -1); // vector to store mouse position

// Create and init lights
let worldLight = new THREE.DirectionalLight(0xffffff);
worldLight.position.set(
  camera.position.x,
  camera.position.y,
  +camera.position.z
);
worldLight.layers.set(worldLayer, objectLayer);
scene.add(worldLight);

let objectLightInner = new THREE.DirectionalLight(0xffffff);
objectLightInner.position.set(0, 0, 1);
objectLightInner.layers.set(objectLayer);
scene.add(objectLightInner);

var objectLightOuter1 = new THREE.DirectionalLight(0xffffff);
objectLightOuter1.position.set(1, 0, 0);
objectLightOuter1.layers.set(objectLayer);
scene.add(objectLightOuter1);

var objectLightOuter2 = new THREE.DirectionalLight(0xffffff);
objectLightOuter2.position.set(-1, 0, 0);
objectLightOuter2.layers.set(objectLayer);
scene.add(objectLightOuter2);

let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Create globe mesh
let earthRadius = 300;
let segments = 128;
let rings = 128;
let mapMaterial = texLoader.load("../src/assets/8081_earthmap10k.jpeg");
let geometry = new THREE.SphereGeometry(earthRadius, segments, rings);
mapMaterial.wrapS = THREE.RepeatWrapping;
mapMaterial.wrapT = THREE.RepeatWrapping;
let material = new THREE.MeshPhongMaterial({
  map: mapMaterial,
  color: 0xb0c8e8,
  // opacity: 0.1,
  // transparent: true,
});
let mesh = new THREE.Mesh(geometry, material);
mesh.layers.set(worldLayer);
scene.add(mesh);

// Skybox
function createPathStrings(filename) {
  const fileType = ".png";
  const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
  const pathStings = sides.map((side) => {
    return filename + "_" + side + fileType;
  });
  return pathStings;
}

function createMaterialArray(filename) {
  const skyboxImagepaths = createPathStrings(filename);
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = texLoader.load(image);
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.5,
    });
  });
  return materialArray;
}

// Draw a single region
function addRegion(shapePoints, covidDataWeek) {
  let shape = new THREE.Shape(shapePoints);
  let outerRadius = 305.0;

  let shapeGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: outerRadius - earthRadius,
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
  shapeMesh.name = covidDataWeek.nuts;
  rootObject.add(shapeMesh);
}

// Draw all regions
function addAllRegions() {
  if (rootObject) {
    scene.remove(rootObject);
  }

  rootObject = new THREE.Object3D();
  scene.add(rootObject);

  props.geoData.features.forEach(function (region) {
    const regionNutsCode = region.properties.NUTS_ID;
    if (props.covidData == null || Object.keys(props.covidData) == 0) {
      console.log("early return", props.covidData == null);
      return;
    }
    const covidDataForDate = props.covidData[props.selectedDate.toJSON()];
    if (!covidDataForDate) {
      debugger;
    }
    const covidDataWeek = covidDataForDate[regionNutsCode];

    if (!covidDataWeek) {
      // could not covid data but a region is available
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
  const canvas = document.querySelector(".webgl");
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
  });
  renderer.setSize(sizes.width, sizes.height);

  // Create and init OrbitControls
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.zoomSpeed = 0.2;
  controls.minDistance = 350;
  controls.maxDistance = 2000;

  let container = document.querySelector("#container");
  container.style.right = `${offset}px`;

  // Setup skybox
  const materialArray = createMaterialArray("../src/assets/skybox/corona");
  const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  const skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);

  // Setup tooltip
  tooltipElement = document.querySelector("#tooltip");

  canvas.addEventListener("mousemove", (event) => {
    tooltipElement.style = `top: ${event.clientY - 6}px; left: ${
      event.clientX + 15
    }px;`;

    // update the mouse variable
    mouse.x = (event.clientX / (window.innerWidth + offset)) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Properly resize window when necessary
  window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth + offset;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
  });

  canvas.addEventListener(
    "click",
    () => {
      emit("regionSelected", intersectedObject?.name);
    },
    false
  );

  const tick = () => {
    renderer.autoClear = true;
    camera.layers.set(worldLayer);
    renderer.render(scene, camera);

    renderer.autoClear = false;
    camera.layers.set(objectLayer);
    renderer.render(scene, camera);

    // Shoot ray to mouse position
    rayCaster.setFromCamera(mouse, camera);
    var intersects = rayCaster.intersectObjects(rootObject.children);

    if (intersects.length > 0) {
      // found an intersecting object
      if (intersects[0].object != intersectedObject) {
        // if the closest object intersected is not the currently stored intersection object
        tooltipElement.classList.remove("hidden");

        // restore previous intersection object (if it exists) to its original color
        if (intersectedObject)
          intersectedObject.material.color.setHex(intersectedObject.currentHex);
        // store reference to closest object as current intersection object
        intersectedObject = intersects[0].object;
        // store color of closest object (for later restoration)
        intersectedObject.currentHex =
          intersectedObject.material.color.getHex();
        // set a new color for closest object
        intersectedObject.material.color.setHex(0x00cc00);

        // update text, if it has a "name" field. This will contain the nuts code of the intersected region
        const name = intersects[0].object.name;
        if (name) {
          var covidDataElement =
            props.covidData[props.selectedDate.toJSON()][name];
          tooltipString.value = `${covidDataElement.region}: ${covidDataElement.incidence}`;
        }
      } // else: it is the same object that is already intersected, so dont do anything
    } else {
      // restore previous intersection object (if it exists) to its original color
      if (intersectedObject)
        intersectedObject.material.color.setHex(intersectedObject.currentHex);

      // remove previous intersection object reference
      intersectedObject = null;
      tooltipElement.classList.add("hidden");
    }

    controls.update(); // let the globe keep spinning if user lets go of the mouse
    window.requestAnimationFrame(tick); // request a new animation frame
  };

  watch(() => props.selectedDate, addAllRegions, { immediate: true });
  tick();
});
</script>

<template>
  <div id="container">
    <canvas class="webgl"></canvas>
    <div id="tooltip" class="hidden">{{ tooltipString }}</div>
  </div>
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
#container {
  position: absolute;
  top: 0px;
  left: 0px;
}
div#tooltip {
  position: absolute;
  top: 0;
  left: 0;
  background: white;
  border: 3px solid black;
}
.hidden {
  display: none;
}
</style>
