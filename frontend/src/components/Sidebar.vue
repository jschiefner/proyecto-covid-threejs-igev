<script setup>
import { computed } from "@vue/reactivity";
import "bulma/css/bulma.css";

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
