<script setup>
import { onMounted } from "@vue/runtime-core";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// for the screen size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

onMounted(() => {
  var scene = new THREE.Scene();
  let canvas = document.querySelector("canvas.webgl");
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setClearColor(0x404040);
  renderer.setSize(sizes.width, sizes.height);
  // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    1,
    2000
  );
  // camera.position.setScalar(1);
  camera.position.z = 400;
  camera.position.y = 400;

  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 0, 0);
  scene.add(light);
  var light2 = new THREE.DirectionalLight(0xffffff);
  light2.position.set(0, 0, 1);
  scene.add(light2);

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.zoomSpeed = 0.1;

  let texLoader = new THREE.TextureLoader();
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
  scene.add(mesh);

  const fileLoader = new THREE.FileLoader();
  fileLoader.load(
    "../src/assets/NUTS_RG_60M_2021_4326_lvl1.geojson",
    (json) => {
      const data = JSON.parse(json);
      addAllRegions(data);
    }
  );

  let extrusionAmount = 3;

  function addRegion(shapePoints) {
    let shape = new THREE.Shape(shapePoints);
    let outerRadius = 305.0;

    let shapeGeometry = shape.extrude({
      amount: outerRadius - earthRadius,
      bevelEnabled: false,
    });

    let offset = Math.random() * extrusionAmount;

    shapeGeometry.vertices.forEach(function (vert, index) {
      let radius;
      if (index < shapeGeometry.vertices.length / 2) {
        radius = earthRadius;
      } else {
        radius = earthRadius + extrusionAmount + offset;
      }
      let phi = ((90.0 - vert.y) * Math.PI) / 180.0;
      let theta = ((360.0 - vert.x) * Math.PI) / 180.0;
      vert.x = radius * Math.sin(phi) * Math.cos(theta);
      vert.y = radius * Math.cos(phi);
      vert.z = radius * Math.sin(phi) * Math.sin(theta);
    });

    // TODO: set appropriate color
    let color = new THREE.Color(0xaa9933);
    color.setHSL(Math.random(), 0.8, 0.8);

    let shapeMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    let shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    rootObject.add(shapeMesh);
  }

  let rootObject = null;

  function addAllRegions(data) {
    if (rootObject) {
      scene.remove(rootObject);
    }

    rootObject = new THREE.Object3D();
    scene.add(rootObject);

    data.features.forEach(function (country) {
      if (country.geometry.coordinates.length === 1) {
        let shapePoints = [];
        country.geometry.coordinates[0].forEach(function (points) {
          shapePoints.push(new THREE.Vector2(points[0], points[1]));
        });
        addRegion(shapePoints);
      } else {
        country.geometry.coordinates.forEach(function (coordSet) {
          if (coordSet.length == 1) {
            let shapePoints = [];
            coordSet[0].forEach(function (points) {
              shapePoints.push(new THREE.Vector2(points[0], points[1]));
            });
            addRegion(shapePoints);
          } else {
            let shapePoints = [];
            coordSet.forEach(function (points) {
              shapePoints.push(new THREE.Vector2(points[0], points[1]));
            });
            addRegion(shapePoints);
          }
        });
      }
    });
  }

  window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
