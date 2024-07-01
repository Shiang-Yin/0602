<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <div class="headerArea">
    <Header />
  </div>
  <RouterView />
</template>

<style scoped lang="scss">
.header {
  widows: 100dvw;
}

</style>
