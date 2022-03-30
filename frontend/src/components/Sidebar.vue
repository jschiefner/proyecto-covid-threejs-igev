<script setup>
import { computed, ref } from "@vue/reactivity";
import "bulma/css/bulma.css";
import moment from "moment";
import { onMounted, watch } from "vue";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import BarChart from "./BarChart.vue";
import { getFlagUrl } from "../helpers/flags.js";

const chartWeeks = 7;

const props = defineProps({
  covidData: Object,
  selectedNutsCode: String,
  selectedDate: Date,
});

const emit = defineEmits([
  "search",
  "dateSelected",
  "oneWeekBack",
  "oneWeekForward",
  "jumpCurrentWeek",
]);

function numberWithDots(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const selectedRegion = computed({
  get() {
    if (props.selectedNutsCode == "") return null;
    if (props.covidData.length == 0) return null;

    const covidDataForDate = props.covidData[props.selectedDate.toJSON()];
    if (!covidDataForDate) {
      return {};
    }
    const covidDataForDateAndNutsCode =
      covidDataForDate[props.selectedNutsCode];
    if (!covidDataForDateAndNutsCode) {
      return {};
    }
    return covidDataForDateAndNutsCode;
  },
});

const isRegionSelected = computed({
  get() {
    if (!props.selectedNutsCode) return false;
    if (props.covidData == null || Object.keys(props.covidData).length == 0)
      return false;

    return true;
  },
});

const currentCovidElement = computed({
  get() {
    if (!isRegionSelected.value) return null;

    return props.covidData[props.selectedDate.toJSON()][props.selectedNutsCode];
  },
});

const chartDataIncidence = computed({
  get() {
    if (!isRegionSelected.value)
      return {
        labels: [],
        datasets: [],
      };

    // create array with labels + accessors for all past 5 dates or so
    const accessors = [];
    const labels = [];
    const referenceDate = moment(props.selectedDate).subtract(
      chartWeeks,
      "weeks"
    );
    for (let i = 0; i < chartWeeks; i++) {
      const date = referenceDate.add(1, "weeks");
      if (date.isDST()) date.add(1, "hour");
      accessors.push(date.toJSON());
      labels.push(date.format("DD/MM/YYYY"));
    }

    // put all covid data with all dates + nuts codes in array for data, map incidence value
    const data = accessors.map((date) => {
      let element = props.covidData[date];
      console.log("extract with date: ", element);
      element = element[props.selectedNutsCode];
      console.log("extract with nuts code: ", element);
      return parseFloat(element.incidence);
    });

    // return labels and data
    return { labels, datasets: [{ data, backgroundColor: "#660000" }] };
  },
});

onMounted(() => {
  const dateInput = document.querySelector("input[name='date']");
  dateInput.classList.add("input");
  dateInput.classList.remove("mx-input");
});
</script>

<template>
  <div id="menucontainer" class="container">
    <!-- Search section -->
    <div class="columns is-vcentered">
      <div class="column">
        <h4 class="title is-4">¿A Donde quieres Viajar?</h4>
      </div>
      <div class="field has-addons column">
        <p class="control has-icons-left">
          <input class="input" placeholder="Ciudad, Region o País" />
          <span class="icon is-small is-left">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
        </p>
        <div class="control">
          <a class="button is-info" @click="this.$emit('search')">Buscar</a>
        </div>
      </div>
    </div>
    <!-- Date picker section -->
    <div class="columns is-vcentered">
      <div class="column">
        <h4 class="title is-4">¿Cuando?</h4>
      </div>
      <div class="column">
        <date-picker
          :value="selectedDate"
          @change="this.$emit('dateSelected', $event)"
          type="week"
          format="DD/MM/YYYY"
          :clearable="false"
          :lang="{ formatLocale: { firstDayOfWeek: 1 } }"
        ></date-picker>
      </div>
      <div class="field has-addons column">
        <p class="control">
          <button class="button" @click="this.$emit('oneWeekBack')">
            <i class="fas fa-angle-left"></i>
          </button>
        </p>
        <p class="control">
          <button class="button" @click="this.$emit('jumpCurrentWeek')">
            <span class="icon is-small">
              <i class="fas fa-calendar-day"></i>
            </span>
            <span>Hoy</span>
          </button>
        </p>
        <p class="control">
          <button class="button" @click="this.$emit('oneWeekForward')">
            <i class="fas fa-angle-right"></i>
          </button>
        </p>
      </div>
    </div>

    <div v-if="isRegionSelected">
      <!-- Info Card Section -->
      <div class="card">
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">{{ currentCovidElement.region }}</p>
              <p class="subtitle is-6">{{ currentCovidElement.country }}</p>
            </div>
            <div class="media-right">
              <figure class="image is-48x48">
                <img
                  :src="getFlagUrl(currentCovidElement.country)"
                  alt="Placeholder image"
                />
              </figure>
            </div>
          </div>

          <nav class="level">
            <div class="level-item has-text-centered">
              <div>
                <p class="heading"><i class="fa fa-virus-covid-slash"></i> Incidencia</p>
                <p class="title">{{numberWithDots(parseInt(currentCovidElement.incidence))}}</p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading"><i class="fa fa-virus-covid"></i> Nuevos Casos</p>
                <p class="title">{{numberWithDots(currentCovidElement.count)}}</p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading"><i class="fa fa-people-group"></i> Population</p>
                <p class="title">{{numberWithDots(currentCovidElement.population)}}</p>
              </div>
            </div>
          </nav>
          <p class="heading is-italic">Datos para la semana del {{moment(props.selectedDate).format('DD/MM/YYYY')}}</p>
        </div>
      </div>

      <div>
        <bar-chart :v-if="drawCharts" :chartData="chartDataIncidence" />
        <bar-chart :v-if="drawCharts" :chartData="chartDataIncidence" />
      </div>
    </div>
    <h4 v-else class="title is-4">selecciona una región en el mapa</h4>
  </div>
</template>

<style scoped>
div#menucontainer {
  position: absolute;
  overflow: scroll;
  height: 100%;
  width: 33%;
  background: #ffffff11;
  z-index: 1;
  color: white;
  text-align: center;
  padding: 2rem 1rem;
}
h4,
h6 {
  color: white;
}

.field {
  justify-content: center;
}

.card {
  background-color: #ffffffaa;
}
</style>
