<script setup>

import { onMounted } from "@vue/runtime-core";
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

onMounted(() => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
  camera.position.setScalar(700);
  let canvas = document.querySelector('canvas.webgl');
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setClearColor(0x404040);
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


  var controls = new OrbitControls(camera, renderer.domElement);

  var paris = {
    lat: 48.864716,
    lon: 2.349014
  };
  console.log(paris);

  var parisSpherical = {
    lat: THREE.Math.degToRad(90 - paris.lat),
    lon: THREE.Math.degToRad(paris.lon)
  };
  console.log(parisSpherical);

  var radius = 500;

  var parisVector = new THREE.Vector3().setFromSphericalCoords(
    radius,
    parisSpherical.lat,
    parisSpherical.lon
  );
  // check we did it correctly
  var spherical = new THREE.Spherical().setFromVector3(parisVector);
  console.log(spherical);
  ////////////////////////////

  var lineGeom = new THREE.BufferGeometry();
  lineGeom.setFromPoints([new THREE.Vector3(), parisVector])
  var line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: "yellow" }));
  scene.add(line);

  var texLoader = new THREE.TextureLoader();
  var tex = texLoader.load("../src/assets/8081_earthmap10k.jpeg");
  var globe = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 100, 100),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.50
    })
  );
  globe.rotation.y = -Math.PI * 0.5;
  scene.add(globe);

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  const tick = () => {
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }

  tick()
})

</script>

<template>
    <canvas class="webgl"></canvas>
</template>

<style scoped>
	html, body {
	height: 100%;
	margin: 0;
	overflow: hidden;
	}
	canvas {
	width: 100%;
	height: 100%;
	}
</style>
