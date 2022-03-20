<script setup>

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

import tireTextureImage from '../assets/tireNormalMap.jpg'
import metalTextureImage from '../assets/metalScratchedNormal.jpeg'
import { onMounted } from '@vue/runtime-core'

// Loading
const textureLoader = new THREE.TextureLoader()
textureLoader.setCrossOrigin("Access-Control-Allow-Origin")
const tireTexture = textureLoader.load(tireTextureImage)
const metalTexture = textureLoader.load(metalTextureImage)

// Scene
const scene = new THREE.Scene()

// Objects

const tireGeometry = new THREE.TorusGeometry(.7, .2, 16, 100)
const carHeightGeometry = new THREE.BoxGeometry(1,2,3)
const carFlatGeometry = new THREE.BoxGeometry(6,0.5,3)

// Materials

// Create a material for the tire that is black and uses a tire texture
const tireMaterial = new THREE.MeshStandardMaterial()
tireMaterial.metalness = 0.5
tireMaterial.roughness = 0.4
tireMaterial.normalMap = tireTexture
tireMaterial.color = new THREE.Color(0x888888)

// Create a material for the Car that is green, metallic and uses a metal texture
const carMaterial = new THREE.MeshStandardMaterial()
carMaterial.metalness = 0.5
carMaterial.roughness = 0.2
carMaterial.normalMap = metalTexture
carMaterial.color = new THREE.Color(0xb1fbcb)

// Mesh

// This is the root mesh all other meshes will be added to
const carHeightMesh = new THREE.Mesh(carHeightGeometry, carMaterial)
carHeightMesh.name = "Car High Mesh"
scene.add(carHeightMesh)

// Add the flat part of the car as a child to the root mesh
const carFlatMesh = new THREE.Mesh(carFlatGeometry, carMaterial)
carFlatMesh.name = 'Car Flat Mesh'
carHeightMesh.add(carFlatMesh)

// Add the first tire to the root mesh
const tireMesh1 = new THREE.Mesh(tireGeometry, tireMaterial)
tireMesh1.name = 'Tire 1 Mesh'
tireMesh1.position.set(-2,-1.2,1)
carHeightMesh.add(tireMesh1)

// Add the second tire to the root mesh
const tireMesh2 = new THREE.Mesh(tireGeometry, tireMaterial)
tireMesh2.name = 'Tire 2 Mesh'
tireMesh2.position.set(-2,-1.2,-1)
carHeightMesh.add(tireMesh2)

// Add the third tire to the root mesh
const tireMesh3 = new THREE.Mesh(tireGeometry, tireMaterial)
tireMesh3.name = 'Tire 3 Mesh'
tireMesh3.position.set(2,-1.2,-1)
carHeightMesh.add(tireMesh3)

// Add the fourth tire to the root mesh
const tireMesh4 = new THREE.Mesh(tireGeometry, tireMaterial)
tireMesh4.name = 'Tire 4 Mesh'
tireMesh4.position.set(2,-1.2,1)
carHeightMesh.add(tireMesh4)

// Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const pointLightRed = new THREE.PointLight(0xff5555, 0.2)
pointLightRed.position.set(2,3,4)
pointLightRed.intensity = 0.3
scene.add(pointLightRed)

const pointLightBlue = new THREE.PointLight(0x3ac9fd, 0.2)
pointLightBlue.position.set(-2,-3,-4)
pointLightBlue.intensity = 0.3

scene.add(pointLightBlue)

// Debug GUI

const gui = new dat.GUI();

[
    carFlatMesh,
    carHeightMesh,
    tireMesh1,
    tireMesh2,
    tireMesh3,
    tireMesh4,
].forEach(mesh => {
    let folder = gui.addFolder(mesh.name)
    folder.add(mesh.position, 'x').step(0.01)
    folder.add(mesh.position, 'y').step(0.01)
    folder.add(mesh.position, 'z').step(0.01)
    folder.add(mesh.scale, 'x').step(0.01)
    folder.add(mesh.scale, 'y').step(0.01)
    folder.add(mesh.scale, 'z').step(0.01)
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-2,3,4)
scene.add(camera)

onMounted(() => {
    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;

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

    /**
     * Render
     */
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
    <h1>Car</h1>
    <canvas class="webgl" ref="webglcanvas"></canvas>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
}

html, body {
    height: 100vh;
    font-family: 'Poppins';
    background: rgb(24, 24, 24);
}

body {
    overflow-x: hidden;
}

.webgl {
    position: fixed;
    top: 0;
    left: 0;
    outline: none;
}
</style>
