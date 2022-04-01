<script setup>
  import { ref } from 'vue';
  import visualization from '../helpers/visualization.js';

  const steps = 20;
  const colors = ref([]);
  for (let i = 0; i < steps; i++) {
    const simulatedIncidence = (i / steps) * visualization.maxIncidence;
    colors.value.push(visualization.colorByIncidence(simulatedIncidence))
  }
</script>

<template>
  <div class="outer columns">
    <div v-for="color in colors" class="column" v-bind:key="color" :style="`background-color: ${color}`"></div>
  </div>
</template>

<style scoped>
.outer {
  height: 15px;
  border-radius: 25px;
  overflow: hidden;
}
</style>
