<script setup>
</script>

<template>
  <div class="">
    <div class="columns is-centered">
      <div class="vertical-center">
        <div class="column">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  text-align: center;
  height: 90%;
  position: relative;
}

.vertical-center {
  text-align: center;
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
</style>
