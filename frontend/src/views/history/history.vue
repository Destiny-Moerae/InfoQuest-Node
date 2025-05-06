<template>
  <div class="history-container">

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'

const loading = ref(false)

const refreshHistory = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.history-container {
  width: 80%;
  padding: 0 40px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;

}
</style>