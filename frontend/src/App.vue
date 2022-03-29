<script setup>
import { loadJsonFile } from "./helpers/fileLoader";

import Globe from "./components/Globe.vue";
import Sidebar from "./components/Sidebar.vue";
import { ref } from "vue";

let covidData = ref([]);

const init = async function() {
  covidData.value = await loadJsonFile(
    "../src/assets/sample-covid-data-2022-10.json"
  );
}

const search = function() {
  // TODO: for now we just empty the array completely to see how the interactivity works
  covidData.value = covidData.value.splice(0, covidData.value.length)
}

init();
</script>

<template>
  <div>
    <Sidebar @search="search"/>
    <Globe :covid-data=covidData />
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>
