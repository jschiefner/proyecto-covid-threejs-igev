<script setup>
</script>

<template>
  <div class="outer">
    <div class="middle">
      <div class="inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.outer {
  display: table;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.middle {
  display: table-cell;
  vertical-align: middle;
}

.inner {
  margin-left: auto;
  margin-right: auto;
  width: 400px;
}
</style>
