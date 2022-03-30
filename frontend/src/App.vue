<script setup>
import { loadJsonFile } from "./helpers/fileLoader";

import Globe from "./components/Globe.vue";
import Sidebar from "./components/Sidebar.vue";
import { ref } from "vue";
import { computed } from "@vue/reactivity";
import moment from 'moment'

moment.updateLocale("en", { week: {
  dow: 1, // First day of week is Monday
  doy: 4  // First week of year must contain 4 January (7 + 1 - 4)
}});

const covidData = ref({});
const selectedNutsCode = ref(null)
const selectedDate = ref(new Date()) // TODO: determine last date somehow?

const init = async function() {
  covidData.value = await loadJsonFile(
    "../src/assets/sample-covid-data-2022-13.json"
  );
  selectedDate.value = new Date('2022-03-07T00:00:00.000Z')
}

const search = function() {
  // TODO: for now we just empty the array completely to see how the interactivity works
  covidData.value = covidData.value.splice(0, covidData.value.length)
}

const regionSelected = function(nuts) {
  selectedNutsCode.value = nuts
}

const dateSelected = function(date) {
  let momentDate = moment(date.toJSON())
  momentDate.utc(true)
  momentDate.startOf('week')
  selectedDate.value = momentDate.toDate()
}

init();
</script>

<template>
  <div>
    <Sidebar :covid-data="covidData" :selectedNutsCode="selectedNutsCode" :selected-date="selectedDate" @date-selected="dateSelected" @search="search"/>
    <Globe :covid-data="covidData" :selected-date="selectedDate" @region-selected="regionSelected" />
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>
