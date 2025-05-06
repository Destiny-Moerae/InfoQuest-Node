<template>
  <div class="flex home-layout">
    <Navbar class="navbar" />
    <AppMain class="app-main" />
  </div>
</template>

<script setup lang='ts' name=''>
import Navbar from './components/navbar.vue'
import AppMain from './components/app-main.vue'
</script>
<style lang='scss' scoped>
.home-layout {
  width: 100vw;
  height: 100vh;
}

.navbar {
  width: 50px;
  height: 100%;
  background-color: #F0F0F0;
}

.app-main {
  flex: 1;
  height: 100%;
}
</style>