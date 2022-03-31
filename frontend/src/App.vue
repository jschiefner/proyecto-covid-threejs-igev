<script setup>
import Globe from "./components/Globe.vue";
import Sidebar from "./components/Sidebar.vue";
import VCenter from "./components/VCenter.vue";
import Spinner from "./components/Spinner.vue";
import load from "./helpers/loader.js";
import { ref } from "vue";
import { computed } from "@vue/reactivity";
import moment from "moment";

// define moment locale and some constants
moment.updateLocale("en", {
  week: {
    dow: 1, // First day of week is Monday
    doy: 4, // First week of year must contain 4 January (7 + 1 - 4)
  },
});

const globeTextureFile = "../src/assets/8081_earthmap10k.jpeg";
const skyboxTextureFile = '../src/assets/skybox/corona';
const geoDataFile = "../src/assets/NUTS_RG_60M_2021_4326.geojson";
const covidDataFile = "../src/assets/sample-covid-data-2022-13.json";
const initialDate = "2022-03-14T00:00:00.000Z"; // TODO: determine last date somehow?

const geoData = ref({});
const covidData = ref({});
const textures = ref({});
const selectedNutsCode = ref(null);
const selectedDate = ref(null);

// Wait until all data is loaded
Promise.all([
  load.jsonFile(geoDataFile),
  load.jsonFile(covidDataFile),
  load.globeTexture(globeTextureFile),
  load.skyboxTexture(skyboxTextureFile)
]).then(([loadedGeoData, loadedCovidData, loadedGlobeTexture, loadedSkyboxTexture]) => {
  geoData.value = loadedGeoData;
  covidData.value = loadedCovidData;
  textures.value.globeTexture = loadedGlobeTexture;
  textures.value.skyboxTexture = loadedSkyboxTexture;
  selectedDate.value = new Date(initialDate);
});

const search = function () {
  // TODO: implement search
};

const regionSelected = function (nuts) {
  selectedNutsCode.value = nuts;
};

const dataLoaded = computed(() => {
  return selectedDate.value != null;
});

const setSelectedDate = function (date) {
  let momentDate = date._isAMomentObject ? date : moment(date);
  momentDate.utc(true);
  momentDate.startOf("week");
  if (momentDate.isDST()) momentDate.add(1, "h");
  selectedDate.value = momentDate.toDate();
};

const oneWeekBack = function () {
  let momentDate = moment(selectedDate.value);
  momentDate.subtract(1, "w");
  setSelectedDate(momentDate.toDate());
};

const oneWeekForward = function () {
  let momentDate = moment(selectedDate.value);
  momentDate.add(1, "w");
  setSelectedDate(momentDate.toDate());
};

const jumpCurrentWeek = function () {
  let momentDate = moment();
  momentDate.utc(true);
  momentDate.startOf("week");
  setSelectedDate(momentDate.toDate());
};
</script>

<template>
  <div>
    <div v-if="dataLoaded">
      <Sidebar
        :covid-data="covidData"
        :selectedNutsCode="selectedNutsCode"
        :selected-date="selectedDate"
        @date-selected="setSelectedDate"
        @one-week-back="oneWeekBack"
        @one-week-forward="oneWeekForward"
        @jumpCurrentWeek="jumpCurrentWeek"
        @search="search"
      />
      <Globe
        :geo-data="geoData"
        :covid-data="covidData"
        :selected-date="selectedDate"
        :selected-nuts-code="selectedNutsCode"
        :textures="textures"
        @region-selected="regionSelected"
      />
    </div>
    <transition name="fade">
      <div v-if="!dataLoaded" class="loading-container">
        <VCenter>
          <Spinner />
          <br />
          <br />
          <h3 class="title is-3">cargando....</h3>
        </VCenter>
      </div>
    </transition>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: black;
}
.title.is-3 {
  color: white;
}
.loading-container {
  background-color: black;
  min-height: 100vh;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 2;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
