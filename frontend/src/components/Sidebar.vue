<script setup>
import { computed, ref } from "@vue/reactivity";
import "bulma/css/bulma.css";
import moment from "moment";
import { onMounted, watch } from "vue";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import BarChart from "./BarChart.vue";

const chartWeeks = 5;

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

const drawCharts = computed({
  get() {
    if (!props.selectedNutsCode) return false
    if (props.covidData == null || Object.keys(props.covidData).length == 0) return false

    return true;
  }
})

const chartDataIncidence = computed({
  get() {
    if (!drawCharts.value) return {
      labels: [],
      datasets: [],
    }

    // create array with labels + accessors for all past 5 dates or so
    const accessors = [];
    const labels = []
    const referenceDate = moment(props.selectedDate).subtract(chartWeeks, "weeks");
    for (let i = 0; i < chartWeeks; i++) {
      const date = referenceDate.add(1, "weeks")
      if (date.isDST()) date.add(1, "hour");
      accessors.push(date.toJSON());
      labels.push(date.format('DD/MM/YYYY'));
    }

    // put all covid data with all dates + nuts codes in array for data, map incidence value
    const data = accessors.map((date) => {
      let element = props.covidData[date]
      console.log("extract with date: ", element)
      element = element[props.selectedNutsCode]
      console.log("extract with nuts code: ", element)
      return parseFloat(element.incidence)
    })

    // return labels and data
    return {labels, datasets: [{data, backgroundColor: "#660000"}]};
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
    <hr />
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
    <hr />
    <div>
      <h6 class="title is-6">Region elegida:</h6>
    </div>
    <div>
      <h4 class="title is-4">
        {{ selectedRegion?.region || "ninguna" }}
      </h4>
    </div>
    <div>
      <bar-chart :v-if="drawCharts" :chartData="chartDataIncidence" />
    </div>
  </div>
</template>

<style scoped>
div#menucontainer {
  position: absolute;
  /* top: 0px;
    left: 0px; */
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
</style>
