<script setup>
import { loadJsonFile } from "./helpers/fileLoader";

import Globe from "./components/Globe.vue";
import Sidebar from "./components/Sidebar.vue";
import { ref } from "vue";

let covidData = ref([]);
let selectedNutsCode = ref("") // TODO: start with ref to null?

const init = async function() {
  covidData.value = await loadJsonFile(
    "../src/assets/sample-covid-data-2022-10.json"
  );
}

const search = function() {
  // TODO: for now we just empty the array completely to see how the interactivity works
  covidData.value = covidData.value.splice(0, covidData.value.length)
}

const regionSelected = function(nuts) {
  selectedNutsCode.value = nuts
}

init();
</script>

<template>
  <div>
    <Sidebar :covid-data="covidData" :selectedNutsCode="selectedNutsCode" @search="search"/>
    <Globe :covid-data=covidData @region-selected="regionSelected"/>
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>
