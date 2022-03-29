<script setup>
import { computed, ref } from "@vue/reactivity";
import "bulma/css/bulma.css";
import { watch } from "vue";
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';

const props = defineProps({
  covidData: Array,
  selectedNutsCode: String,
});

const selectedRegion = computed({
  get() {
    if (props.selectedNutsCode == "") return null;
    if (props.covidData.length == 0) return null;

    return props.covidData.find((element) => element.nuts == props.selectedNutsCode);
  },
});

const selectedDate = ref(new Date());
const setSelectedDate = function(date) {
  const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  selectedDate.value = new Date(date.setDate(diff))
}

const emit = defineEmits(["search"]);
</script>

<template>
  <div id="menucontainer" class="container">
    <h4 class="title is-4">¿A Donde quieres Viajar?</h4>
    <div class="field has-addons">
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
    <hr />
    <date-picker :value="selectedDate" @change="setSelectedDate" type="week" format="DD/MM/YYYY" :clearable="false" :lang="{formatLocale: {firstDayOfWeek: 1}}"></date-picker>
    <hr />
    <h1>selected region: {{selectedRegion == null ? "none" : selectedRegion.region}}</h1>
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
  padding: 1rem;
}
h4 {
  color: white;
}

.field {
  justify-content: center;
}
</style>
