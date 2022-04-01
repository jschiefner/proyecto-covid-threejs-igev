<script setup>
import { computed, nextTick, onMounted, watch } from "@vue/runtime-core";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VueElement, ref } from "vue";
import * as TWEEN from "@tweenjs/tween.js";
import visualization from "../helpers/visualization.js";
import { getRegionName, getCountryName, getFlagUrl } from "../helpers/regionNames.js";

const props = defineProps({
  geoData: Object,
  covidData: Object,
  selectedDate: Date,
  selectedNutsCode: String,
  textures: Object,
});

const emit = defineEmits(["regionSelected"]);

// Create globally usable variables for data
let tooltipElement;
const cameraTargetPosition = new THREE.Vector3(370, 370, -15);
const cameraInitialPosition = new THREE.Vector3(1000, 500, 2000);
const selectedColor = 0x0588e6;
const hoverColor = 0x6dc1fd;
const unavailableColor = "#333333";
const regionMeshData = {};
// structure of this variable:
//   ATT2: [
//     {
//       mesh: mesh1,
//       shape: [{x,y}, {x,y}, ...],
//     },
//     {
//       mesh: mesh2,
//       shape: [{x,y}, {x,y}, ...],
//     },
//   ],
// };

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
camera.position.set(
  cameraInitialPosition.x,
  cameraInitialPosition.y,
  cameraInitialPosition.z
);

// Prepare Raycaster
var rayCaster = new THREE.Raycaster();
rayCaster.layers.set(objectLayer);
let mouse = new THREE.Vector2(-1, -1); // vector to store mouse position
let hoveredNutsCode = ref(null);

// Create and init lights
let worldLight = new THREE.DirectionalLight(0xffffff);
worldLight.position.set(
  cameraTargetPosition.x,
  cameraTargetPosition.y,
  cameraTargetPosition.z
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
let mapMaterial = props.textures.globeTexture;
let geometry = new THREE.SphereGeometry(earthRadius, segments, rings);
mapMaterial.wrapS = THREE.RepeatWrapping;
mapMaterial.wrapT = THREE.RepeatWrapping;
let material = new THREE.MeshPhongMaterial({
  map: mapMaterial,
  color: 0xb0c8e8,
});
let mesh = new THREE.Mesh(geometry, material);
mesh.layers.set(worldLayer);
scene.add(mesh);

function createShapeGeometry(shapePoints, extrusion) {
  scene.add(rootObject);
  const shapeGeometry = new THREE.ExtrudeGeometry(
    new THREE.Shape(shapePoints),
    {
      depth: 5,
      bevelEnabled: false,
    }
  );

  shapeGeometry.vertices.forEach((vertex, index) => {
    let radius;
    if (index < shapeGeometry.vertices.length / 2) {
      radius = earthRadius;
    } else {
      radius = earthRadius + extrusion;
    }
    let phi = ((90.0 - vertex.y) * Math.PI) / 180.0;
    let theta = ((360.0 - vertex.x) * Math.PI) / 180.0;
    vertex.x = radius * Math.sin(phi) * Math.cos(theta);
    vertex.y = radius * Math.cos(phi);
    vertex.z = radius * Math.sin(phi) * Math.sin(theta);
  });

  return shapeGeometry;
}

function createRegions() {
  let regions = props.geoData.features;
  regions.forEach((region) => {
    const regionNutsCode = region.properties.NUTS_ID;

    //* Create the region 2d shapes
    //* array including all 2d unwarped shapes for a region [[{x,y}, {x,y}, ...], [{x,y}, {x,y}, ...], ...]
    // TODO: new THREE.Shape() instead of shapepoints as array?
    const shapePointsArray = [];
    if (region.geometry.coordinates.length === 1) {
      // Single Polygon
      const shapePoints = region.geometry.coordinates[0].map((point) => {
        return new THREE.Vector2(point[0], point[1]);
      });
      shapePointsArray.push(shapePoints);
    } else {
      // Multipolygon
      region.geometry.coordinates.forEach((coordinateSet) => {
        // TODO: maybe this can be simplified with the new structure?
        if (coordinateSet.length === 1) {
          // nested one level deeper
          const shapePoints = coordinateSet[0].map((point) => {
            return new THREE.Vector2(point[0], point[1]);
          });
          shapePointsArray.push(shapePoints);
        } else {
          // nested on the same level
          const shapePoints = coordinateSet.map((point) => {
            return new THREE.Vector2(point[0], point[1]);
          });
          shapePointsArray.push(shapePoints);
        }
      });
    }

    //* Create the region mesh objects
    //* add region recevied an object of shapepoints, so an inner array [{x,y}, {x,y}, ...]
    const meshes = [];

    shapePointsArray.forEach((shapePoints) => {
      // with one shapePoints array [{x,y}, {x,y}, ...] create a new mesh
      let extrusion = 1; // ? adjust this value maybe? just an original extrusion from which can be animated

      // TODO: implement this
      const shapeGeometry = createShapeGeometry(shapePoints, extrusion);

      // TODO: enough to do this once on the top probably (allthough not sure with the color since that needs to be different)
      const shapeMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff, // TODO: use color scheme
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
      mesh.layers.set(objectLayer);
      mesh.name = regionNutsCode;
      rootObject.add(mesh);

      meshes.push(mesh);
    });

    // Add to regionMeshData
    const output = [];
    shapePointsArray.forEach((shapePoints, index) => {
      output.push({
        mesh: meshes[index],
        shape: shapePoints,
      });
    });

    regionMeshData[regionNutsCode] = output;
  });
}

function updateRegions(animationTime) {
  for (const nuts in regionMeshData) {
    regionMeshData[nuts].forEach(({ mesh, shape }) => {
      const covidDataWeek = props.covidData[props.selectedDate.toJSON()][nuts];
      let color;
      let extrusion;
      if (covidDataWeek?.incidence) {
        color = new THREE.Color(
          visualization.colorByIncidence(covidDataWeek.incidence)
        );
        extrusion = visualization.extrusion(covidDataWeek.incidence);
      } else {
        color = new THREE.Color(unavailableColor);
        extrusion = visualization.extrusion(100);
      }
      const shapeGeometry = createShapeGeometry(shape, extrusion);

      // animate color if necessary
      if (nuts != props.selectedNutsCode) {
        new TWEEN.Tween(mesh.material.color)
          .to(color, animationTime)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            mesh.geometry.verticesNeedUpdate = true;
          })
          .start();
      }

      // animate vertices
      mesh.geometry.vertices.forEach((vertex, index) => {
        new TWEEN.Tween(vertex)
          .to(shapeGeometry.vertices[index], animationTime)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            mesh.geometry.verticesNeedUpdate = true;
          })
          .start();
      });
    });
  }
}

function setRegionColor(nuts, color) {
  if (!color) {
    const covidDataWeek = props.covidData[props.selectedDate.toJSON()][nuts];
    color = new THREE.Color(
      covidDataWeek?.incidence
        ? visualization.colorByIncidence(covidDataWeek.incidence)
        : unavailableColor
    );
  }
  const selectedRegion = regionMeshData[nuts];
  selectedRegion.forEach(({ mesh }) => {
    mesh.material.color.set(color);
  });
}

function onNutsCodeSelected(newValue, oldValue) {
  if (oldValue) setRegionColor(oldValue);
  if (newValue) setRegionColor(newValue, selectedColor);
}

const animateToRegion = function () {
  const vertex =
    regionMeshData[props.selectedNutsCode][0].mesh.geometry.vertices[0];
  const vertexVector = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
  const cameraDistance = camera.position.length();
  vertexVector.multiplyScalar(cameraDistance / vertexVector.length());

  new TWEEN.Tween(camera.position)
    .to(vertexVector, 2000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};
defineExpose({ animateToRegion });

const getHoveredIncidence = computed({
  get() {
    const covidDataWeek =
      props.covidData[props.selectedDate.toJSON()][hoveredNutsCode.value];
    if (covidDataWeek?.incidence) {
      return `Incidencia: ${parseInt(covidDataWeek.incidence)}`;
    } else {
      return 'Incidencia: no disponible'
    }
  },
});

const getHoveredNewCases = computed({
  get() {
    const covidDataWeek =
      props.covidData[props.selectedDate.toJSON()][hoveredNutsCode.value];
    if (covidDataWeek?.count) {
      return `Nuevos casos: ${covidDataWeek.count} (${((covidDataWeek.count / covidDataWeek.population) * 100).toFixed(2)}%)`;
    } else {
      return 'Nuevos casos: no disponible'
    }
  },
});

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
  const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  const skybox = new THREE.Mesh(skyboxGeo, props.textures.skyboxTexture);
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
      emit("regionSelected", hoveredNutsCode.value);
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
      if (intersects[0].object.name != hoveredNutsCode.value) {
        // if the closest object intersected is not the currently stored intersection object
        tooltipElement.classList.remove("hidden");

        // restore previous intersection object (if it exists) to its original color
        if (hoveredNutsCode.value && hoveredNutsCode.value != props.selectedNutsCode) {
          setRegionColor(hoveredNutsCode.value);
        }

        // store reference to closest object as current intersection object
        hoveredNutsCode.value = intersects[0].object.name;
        setRegionColor(hoveredNutsCode.value, hoverColor);

        if (
          props.selectedNutsCode &&
          props.selectedNutsCode != hoveredNutsCode
        ) {
          setRegionColor(props.selectedNutsCode, selectedColor);
        }
      } // else: it is the same object that is already intersected, so dont do anything
    } else {
      // restore previous intersection object (if it exists) to its original color
      if (hoveredNutsCode.value) {
        setRegionColor(hoveredNutsCode.value);
      }
      if (props.selectedNutsCode) {
        setRegionColor(props.selectedNutsCode, selectedColor);
      }

      // remove previous intersection object reference
      hoveredNutsCode.value = null;
      tooltipElement.classList.add("hidden");
    }

    controls.update(); // let the globe keep spinning if user lets go of the mouse
    TWEEN.update();
    window.requestAnimationFrame(tick); // request a new animation frame
  };

  watch(
    props.covidData,
    () => {
      const animationTime = 3000;
      createRegions();
      updateRegions(animationTime * 1.3);
      new TWEEN.Tween(camera.position)
        .to(cameraTargetPosition, animationTime)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    },
    { immediate: true }
  );

  watch(
    () => props.selectedDate,
    () => updateRegions(300)
  );
  watch(() => props.selectedNutsCode, onNutsCodeSelected);
  tick();
});
</script>

<template>
  <div id="container">
    <canvas class="webgl"></canvas>
    <div id="tooltip" class="box hidden">
      <h5 class="title is-5">{{ hoveredNutsCode ? getRegionName(hoveredNutsCode) : null }}</h5>
      <div class="subtitle">
          <img :src="getFlagUrl(hoveredNutsCode, true)" class="vertical-align tooltip-flag-image"/>
          <span class="vertical-align">{{ hoveredNutsCode ? getCountryName(hoveredNutsCode) : null }}</span>
      </div>

      <p>{{ getHoveredIncidence }}</p>
      <p>{{ getHoveredNewCases }}</p>
    </div>
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
  background: white;
  padding: 0.5rem;
  width: 16rem;
}

#tooltip .subtitle {
  font-size: 0.8rem;
}

.hidden {
  display: none;
}

img.tooltip-flag-image {
  margin-right: 0.3rem;
}

.vertical-align {
  vertical-align: middle;
}
</style>
