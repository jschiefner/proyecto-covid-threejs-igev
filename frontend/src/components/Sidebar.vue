<script setup>
import { computed, ref } from "@vue/reactivity";
import "bulma/css/bulma.css";
import "bulma-slider/dist/css/bulma-slider.min.css";
import "bulma-switch/dist/css/bulma-switch.min.css";
import moment from "moment";
import { onMounted, watch } from "vue";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import BarChart from "./BarChart.vue";
import VCenter from "./VCenter.vue";
import visualization from "../helpers/visualization.js";
import SimpleTypeahead from "vue3-simple-typeahead";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css";
import { getRegionName, getCountryName, getRegionList, getFlagUrl } from "../helpers/regionNames.js";
import Gradient from "./Gradient.vue";
import { getFirstDate, getLastDate } from "../helpers/dates.js";

let firstDate;
let lastDate;

const chartDisplayWeeks = ref(14);
const casesChartDivide = ref(false);

const props = defineProps({
  geoData: Object,
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
  if (!x) return "no disponible";
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const selectedRegion = computed({
  get() {
    if (props.selectedNutsCode == "") return null;
    if (props.covidData.length == 0) return null;

    return props.covidData[props.selectedDate.toJSON()][props.selectedNutsCode];
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

const disabledDates = function(date, currentValue) {
  return date < firstDate || date > moment(lastDate).add(6, "days").toDate();
}

const currentCovidElement = computed({
  get() {
    if (!isRegionSelected.value) return null;

    let covidWeekData = props.covidData[props.selectedDate.toJSON()]
    if (!covidWeekData) return undefined;
    return covidWeekData[props.selectedNutsCode];
  },
});

const extractAccessorsAndLabels = function () {
  const accessors = [];
  const labels = [];
  let date = moment(props.selectedDate).subtract(
    chartDisplayWeeks.value,
    "weeks"
  );
  let isDST = date.isDST();
  for (let i = 0; i < chartDisplayWeeks.value; i++) {
    date.add(1, "weeks");
    date = date.startOf("week");
    date.utc(true);
    accessors.push(date.toJSON());
    labels.push(date.format("DD/MM/YYYY"));
  }

  return { accessors, labels };
};

const chartDataIncidence = computed({
  get() {
    if (!isRegionSelected.value)
      return {
        labels: [],
        datasets: [],
      };

    const { accessors, labels } = extractAccessorsAndLabels();

    const data = [];
    const colors = [];
    accessors.forEach((date) => {
      const element = props.covidData[date]?.[props.selectedNutsCode];
      if (element?.incidence) {
        data.push(parseFloat(element.incidence));
        colors.push(visualization.colorByIncidence(element.incidence));
      } else {
        data.push(null)
        colors.push(null)
      }
    });

    // return labels and data
    return {
      labels,
      datasets: [{ data, backgroundColor: colors }],
    };
  },
});

const chartDataNewCases = computed({
  get() {
    if (!isRegionSelected.value)
      return {
        labels: [],
        datasets: [],
      };

    const { accessors, labels } = extractAccessorsAndLabels();

    const data = [];
    const colors = [];
    accessors.forEach((date) => {
      const element = props.covidData[date]?.[props.selectedNutsCode];
      if (element) {
        const proportion = parseFloat(element.count) / parseFloat(element.population);
        data.push(casesChartDivide.value ? proportion : parseFloat(element.count));
        colors.push(visualization.colorByProportion(proportion));
      } else {
        data.push(null);
        colors.push(null);
      }
    });

    return {
      labels,
      datasets: [{ data, backgroundColor: colors }],
    };
  },
});

const sliderChanged = function (event) {
  const value = parseInt(event.target.value);
  chartDisplayWeeks.value = value;
};

const checkboxChanged = function () {
  casesChartDivide.value = !casesChartDivide.value;
};

onMounted(() => {
  firstDate = new Date(getFirstDate(props.covidData));
  lastDate = new Date(getLastDate(props.covidData));

  const dateInput = document.querySelector("input[name='date']");
  dateInput.classList.add("input");
  dateInput.classList.remove("mx-input");

  const datePicker = document.querySelector("div.mx-datepicker");

  const typeaheadInput = document.querySelector("#typeahead_id");
  typeaheadInput.classList.add("input");
});
</script>

<template>
  <div id="menucontainer" class="container">
    <!-- Search section -->
    <div class="columns is-centered is-vcentered">
      <div class="column is-narrow">
        <div class="field has-addons">
          <p class="control has-icons-left">
            <SimpleTypeahead
              id="typeahead_id"
              placeholder="Buscar"
              :items="getRegionList()"
              :minInputLength="1"
              @selectItem="this.$emit('search', $event)"
              >
            	<template #list-item-text="slot"><span v-html="slot.boldMatchText(slot.itemProjection(slot.item))" class="search-suggestion-text"></span></template>
            </SimpleTypeahead>
            <span class="icon is-small is-left search-span">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
          </p>
        </div>
      </div>
      <div class="column">
        <date-picker
          :value="selectedDate"
          @change="this.$emit('dateSelected', $event)"
          type="week"
          format="DD/MM/YYYY"
          :clearable="false"
          :lang="{ formatLocale: { firstDayOfWeek: 1 } }"
          :disabled-date="disabledDates"
        ></date-picker>
      </div>
      <div class="column">
        <div class="field has-addons">
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
    </div>

    <div v-if="isRegionSelected">
      <!-- Info Card Section -->
      <div class="card transparent-background">
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">{{ getRegionName(selectedNutsCode) }}</p>
              <p class="subtitle is-6">{{ getCountryName(selectedNutsCode) }}</p>
            </div>
            <div class="media-right">
              <figure class="image is-48x48">
                <img
                  :src="getFlagUrl(selectedNutsCode)"
                  alt="Placeholder image"
                />
              </figure>
            </div>
          </div>
          <!-- level in card -->
          <nav class="level">
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">
                  <i class="fa fa-virus-covid-slash"></i> Incidencia
                </p>
                <p class="title">
                  {{ numberWithDots(parseInt(currentCovidElement?.incidence)) }}
                </p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">
                  <i class="fa fa-virus-covid"></i> Nuevos Casos
                </p>
                <p class="title">
                  {{ numberWithDots(currentCovidElement?.count) }}
                </p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">
                  <i class="fa fa-people-group"></i> Población
                </p>
                <p class="title">
                  {{ numberWithDots(currentCovidElement?.population) }}
                </p>
              </div>
            </div>
          </nav>
          <p class="heading is-italic">
            Datos para la semana del
            {{ moment(props.selectedDate).format("DD/MM/YYYY") }}
          </p>
        </div>
      </div>

      <!-- Charts section -->
      <div>
        <h5 class="title is-5 chart-title">
          Incidencia accumulada de casos en 14 dias de las semanas pasadas
        </h5>
        <bar-chart :v-if="isRegionSelected" :chartData="chartDataIncidence" />
        <h5 class="title is-5 chart-title">Nuevos casos en semanas pasadas</h5>
        <bar-chart
          :v-if="isRegionSelected"
          :chartData="chartDataNewCases"
          :custom-tick-callback="
            (value, index, ticks) =>
              casesChartDivide ? `${(value * 100).toFixed(2)}%` : value
          "
        />
      </div>
      <div class="box transparent-background">
        <div class="columns is-vcentered">
          <div class="column is-one-fifth">Peligrosidad: </div>
          <div class="column is-four-fifth gradient-column">
            <Gradient />
          </div>
        </div>
        <div class="columns is-vcentered">
          <div class="column">
            <label class="label"
              >Semanas mostradas: {{ chartDisplayWeeks }}</label
            >
          </div>
          <div class="column">
            <input
              class="slider is-fullwidth is-info is-circle has-output-tooltip"
              step="1"
              min="5"
              max="20"
              :value="chartDisplayWeeks"
              type="range"
              @input="sliderChanged"
            />
          </div>
          <div class="column">
            <label class="label">Mostrar proporción</label>
          </div>
          <div class="column">
            <div class="field">
              <input
                id="switchRoundedSuccess"
                type="checkbox"
                name="switchRoundedSuccess"
                class="switch is-rounded is-info"
                @change="checkboxChanged"
              />
              <label for="switchRoundedSuccess"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <VCenter v-else>
      <h2 class="title is-2">Selecciona una región en el mapa</h2>
    </VCenter>
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
  padding: 1rem;
}

h2,
h4,
h5,
h6 {
  color: white;
}

.field {
  justify-content: center;
}

.transparent-background {
  background-color: #ffffff99;
}

.chart-title {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.no-selection-message {
  height: 80%;
  display: flex;
  align-content: center;
  justify-content: center;
}

span.search-span {
  color: black !important;
}

.search-suggestion-text {
  color: black !important;
}

.box {
  margin-top: 1rem;
}

.gradient-column {
  margin-bottom: -10px;
}
</style>
