<script setup>
import { onMounted } from "@vue/runtime-core";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let radius = 1;

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

  var camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 2000);
  // camera.position.setScalar(1);
  camera.position.z = 400
  camera.position.y = 400

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
  controls.zoomSpeed = 0.1

  var texLoader = new THREE.TextureLoader();
  // var tex = texLoader.load("../src/assets/8081_earthmap10k.jpeg");
  var material_map = texLoader.load("../src/assets/8081_earthmap10k.jpeg");
  var radius = 300;
  var segments = 128;
  var rings = 128;
  var geometry = new THREE.SphereGeometry(radius, segments, rings);

  material_map.wrapS = THREE.RepeatWrapping;
  material_map.wrapT = THREE.RepeatWrapping;
  // material_map.repeat.set(8, 8);
  let material = new THREE.MeshPhongMaterial({
      map: material_map,
      color: 0x3366aa
  });
  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);


  const fileLoader = new THREE.FileLoader()
  fileLoader.load('../src/assets/NUTS_RG_60M_2021_4326_lvl1.geojson', (json) => {
    const data = JSON.parse(json)
    add_all_regions(data)
  })

  let extrusion_amount = 1
  let uniform_color = false
  let uniform_height = false

  function add_region(shape_points) {
      var shape = new THREE.Shape(shape_points);
      var shape_geom;
      var inner_radius = 300.0;
      var outer_radius = 305.0;

      shape_geom = shape.extrude({
          amount: outer_radius - inner_radius,
          bevelEnabled: false
      });

      var offset = 0;
      if ( ! uniform_height )
            offset = Math.random() * extrusion_amount;

      shape_geom.vertices.forEach(function (vert, index) {
          var radius = 0.0;
          if (index < shape_geom.vertices.length / 2) {
              radius = inner_radius;
          } else {
              radius = inner_radius + extrusion_amount + offset;
          }
          var phi = (90.0 - vert.y) * Math.PI / 180.0;
          var theta = (360.0 - vert.x) * Math.PI / 180.0;
          vert.x = radius * Math.sin(phi) * Math.cos(theta);;
          vert.y = radius * Math.cos(phi);;
          vert.z = radius * Math.sin(phi) * Math.sin(theta);;
      });

      var color = new THREE.Color(0xaa9933);
      if (! uniform_color)
          color.setHSL(Math.random(),0.8,0.8 );

      var shape_material = new THREE.MeshPhongMaterial({
          color: color,
          side: THREE.DoubleSide
      });
      var shape_mesh = new THREE.Mesh(shape_geom, shape_material);
      root_object.add(shape_mesh);
  }

  let root_object = null;

  function add_all_regions(data) {

      if ( root_object ) {
          scene.remove(root_object);
      }

      root_object = new THREE.Object3D();
      scene.add(root_object);

      data.features.forEach(function (country) {
          if (country.geometry.coordinates.length === 1) {
              var shape_points = [];
              country.geometry.coordinates[0].forEach(function (points) {
                  shape_points.push(new THREE.Vector2(points[0], points[1]));
              });
              add_region(shape_points);
          } else {
              country.geometry.coordinates.forEach(function (coord_set) {
                  if (coord_set.length == 1) {
                      var shape_points = [];
                      coord_set[0].forEach(function (points) {
                          shape_points.push(new THREE.Vector2(points[0], points[1]));
                      });
                      add_region(shape_points);
                  } else {
                      var shape_points = [];
                      coord_set.forEach(function (points) {
                          shape_points.push(new THREE.Vector2(points[0], points[1]));
                      });
                      add_region(shape_points);
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
