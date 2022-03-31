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
import { getFlagUrl } from "../helpers/flags.js";
import VCenter from "./VCenter.vue"
import visualization from "../helpers/visualization.js";

const chartDisplayWeeks = ref(5);
const casesChartDivide = ref(false);

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

const currentCovidElement = computed({
  get() {
    if (!isRegionSelected.value) return null;

    return props.covidData[props.selectedDate.toJSON()][props.selectedNutsCode];
  },
});

const extractAccessorsAndLabels = function () {
  const accessors = [];
  const labels = [];
  const referenceDate = moment(props.selectedDate).subtract(
    chartDisplayWeeks.value,
    "weeks"
  );
  for (let i = 0; i < chartDisplayWeeks.value; i++) {
    const date = referenceDate.add(1, "weeks");
    if (date.isDST()) date.add(1, "hour");
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
      let element = props.covidData[date][props.selectedNutsCode];
      data.push(parseFloat(element.incidence));
      colors.push(visualization.colorByIncidence(element.incidence))
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
      let element = props.covidData[date][props.selectedNutsCode];
      let proportion = parseFloat(element.count) / parseFloat(element.population)
      data.push(casesChartDivide.value ? proportion : parseFloat(element.count));
      colors.push(visualization.colorByProportion(proportion))
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
  const dateInput = document.querySelector("input[name='date']");
  dateInput.classList.add("input");
  dateInput.classList.remove("mx-input");

  const datePicker = document.querySelector("div.mx-datepicker");
  datePicker.style.width = "150px";
});
</script>

<template>
  <div id="menucontainer" class="container">
    <!-- Search section -->
    <div class="columns is-vcentered is-centered">
      <div class="column">
        <div class="field has-addons">
          <p class="control has-icons-left">
            <input class="input" placeholder="Region" />
            <span class="icon is-small is-left">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
          </p>
          <div class="control">
            <a class="button is-info" @click="this.$emit('search')">Buscar</a>
          </div>
        </div>
      </div>
      <div class="column is-narrow">
        <date-picker
          :value="selectedDate"
          @change="this.$emit('dateSelected', $event)"
          type="week"
          format="DD/MM/YYYY"
          :clearable="false"
          :lang="{ formatLocale: { firstDayOfWeek: 1 } }"
        ></date-picker>
      </div>
      <div class="column is-narrow">
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
          <!-- level in card -->
          <nav class="level">
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">
                  <i class="fa fa-virus-covid-slash"></i> Incidencia
                </p>
                <p class="title">
                  {{ numberWithDots(parseInt(currentCovidElement.incidence)) }}
                </p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">
                  <i class="fa fa-virus-covid"></i> Nuevos Casos
                </p>
                <p class="title">
                  {{ numberWithDots(currentCovidElement.count) }}
                </p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">
                  <i class="fa fa-people-group"></i> Población
                </p>
                <p class="title">
                  {{ numberWithDots(currentCovidElement.population) }}
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
              value="7"
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
  padding: 2rem 1rem;
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


</style>
