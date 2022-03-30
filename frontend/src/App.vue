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
const selectedNutsCode = ref(null) // TODO: remove hardcoded value
const selectedDate = ref(new Date('2022-03-14T00:00:00.000Z')) // TODO: determine last date somehow?

const init = async function() {
  covidData.value = await loadJsonFile(
    "../src/assets/sample-covid-data-2022-13.json"
  );
  console.log("fetched covid data")
  selectedDate.value = new Date('2022-03-14T00:00:00.000Z') // TODO: improve this so i dont have to set this here again in order to render after awaiting this
}

const search = function() {
  // TODO: for now we just empty the array completely to see how the interactivity works
  covidData.value = covidData.value.splice(0, covidData.value.length)
}

const regionSelected = function(nuts) {
  selectedNutsCode.value = nuts
}

const setSelectedDate = function(date) {
  let momentDate = date._isAMomentObject ? date : moment(date)
  momentDate.utc(true)
  momentDate.startOf('week')
  if (momentDate.isDST()) momentDate.add(1, 'h')
  selectedDate.value = momentDate.toDate()
}

const oneWeekBack = function() {
  let momentDate = moment(selectedDate.value)
  momentDate.subtract(1, 'w')
  setSelectedDate(momentDate.toDate())
}

const oneWeekForward = function() {
  let momentDate = moment(selectedDate.value)
  momentDate.add(1, 'w')
  setSelectedDate(momentDate.toDate())
}

const jumpCurrentWeek = function() {
  let momentDate = moment()
  momentDate.utc(true)
  momentDate.startOf('week')
  setSelectedDate(momentDate.toDate())
}

init();
</script>

<template>
  <div>
    <Sidebar :covid-data="covidData" :selectedNutsCode="selectedNutsCode" :selected-date="selectedDate" @date-selected="setSelectedDate"  @one-week-back="oneWeekBack" @one-week-forward="oneWeekForward" @jumpCurrentWeek="jumpCurrentWeek" @search="search"/>
    <Globe :covid-data="covidData" :selected-date="selectedDate" @region-selected="regionSelected" />
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>
