<script setup>

import { onMounted } from "@vue/runtime-core";
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

onMounted(() => {
    console.clear();

    var materialShader;

    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
    camera.position.set(0, 0, 15);

    const canvas = document.querySelector('canvas.webgl')
    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        alpha: true,
    });

    /**
     * Renderer
     */
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Controls
    const controls = new OrbitControls(camera, canvas);
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

    var light = new THREE.DirectionalLight(0xffffff, 0.25);
    light.position.setScalar(1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    var geom = new THREE.SphereBufferGeometry(5, 64, 36);
    var material = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load('../src/assets/earth.jpeg')
    });

    var maxImpactAmount = 1;
    // init uniforms impacts array
    var impacts = [];
    for (let i = 0; i < maxImpactAmount; i++) {
      impacts.push({
        impactPosition: new THREE.Vector3().setFromSphericalCoords(
          geom.parameters.radius,
          Math.PI * Math.random(),
          Math.PI * 2 * Math.random()
        ),
        impactMaxRadius: geom.parameters.radius * THREE.Math.randFloat(0.5, 0.75),
        impactRatio: 0.25
      });
    }

    console.log(impacts);

    material.onBeforeCompile = shader => {
      shader.uniforms.impacts = { value: impacts };
      shader.vertexShader = "varying vec3 vPosition;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
    vPosition = transformed.xyz;`
      );
      shader.fragmentShader =
        `struct impact {
        vec3 impactPosition;
        float impactMaxRadius;
        float impactRatio;
      };
     uniform impact impacts[${maxImpactAmount}];
     varying vec3 vPosition;
    ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
      float finalStep = 0.0;
      for (int i = 0; i < ${maxImpactAmount};i++){

        float dist = distance(vPosition, impacts[i].impactPosition);
        float curRadius = impacts[i].impactMaxRadius * impacts[i].impactRatio;
        float sstep = smoothstep(0., curRadius, dist) - smoothstep(curRadius - ( 0.25 * impacts[i].impactRatio ), curRadius, dist);
        sstep *= 1. - impacts[i].impactRatio;
        finalStep += sstep;

      }
      finalStep = 1. - clamp(finalStep, 0., 1.);

      vec3 col = mix(vec3(1., 0.5, 0.0625), vec3(1.,0.125, 0.0625), finalStep);
      gl_FragColor = vec4( mix( col, gl_FragColor.rgb, finalStep), diffuseColor.a );`
      );
      materialShader = shader;
      console.log(shader);
    };

    var globe = new THREE.Mesh(geom, material);
    scene.add(globe);

    var tweens = [];

    for (let i = 0; i < maxImpactAmount; i++) {
      tweens.push({
        runTween: function () {
          var tween = new TWEEN.Tween({ value: 0 })
            .to({ value: 1 }, THREE.Math.randInt(2500, 5000))
            //.delay(THREE.Math.randInt(500, 2000))
            .onUpdate(val => {
              if (materialShader)
                materialShader.uniforms.impacts.value[i].impactRatio = val.value;
            })
            .onComplete(val => {
              if (materialShader) {
                materialShader.uniforms.impacts.value[i].impactPosition.setFromSphericalCoords(
                  geom.parameters.radius,
                  Math.PI * Math.random(),
                  Math.PI * 2 * Math.random()
                );
                materialShader.uniforms.impacts.value[i].impactMaxRadius = geom.parameters.radius * THREE.Math.randFloat(0.5, 0.75);
              }
              tweens[i].runTween();
            });
          tween.start();
        }
      });
    }

    tweens.forEach(t => { t.runTween(); })

    /**
     * Render
     */
    const tick = () => {
        // Render
        renderer.render(scene, camera)

        TWEEN.update();

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()
})

</script>

<template>
    <canvas width="3008" height="1528" class="webgl"></canvas>
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
    display: block;
}
</style>
