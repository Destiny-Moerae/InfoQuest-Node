<template>
  <div class="navbar-container">
    <!-- 顶部功能区域 -->
    <div class="nav-top">
      <router-link to="/dataset" class="nav-item" :class="{ 'active': $route.path === '/dataset' }">
        <el-icon class="nav-icon">
          <Document />
        </el-icon>
      </router-link>

      <router-link to="/chat" class="nav-item" :class="{ 'active': $route.path === '/chat' }">
        <el-icon class="nav-icon">
          <ChatRound />
        </el-icon>
      </router-link>
    </div>

    <!-- 底部历史记录 -->
    <div class="nav-bottom">
      <router-link to="/history" class="nav-item" :class="{ 'active': $route.path === '/history' }">
        <el-icon class="nav-icon">
          <Clock />
        </el-icon>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, ChatRound, Clock } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.navbar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;

  .nav-top {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 0;
  }

  .nav-item {
    display: flex;
    justify-content: center;
    padding: 12px 0;
    transition: all 0.3s;

    &:hover {
      background: #e9ecef;
    }

    &.active {
      color: #1890ff;
      border-right: 2px solid #1890ff;

      .nav-icon {
        transform: scale(1.1);
      }
    }
  }

  .nav-icon {
    width: 24px;
    height: 24px;
    transition: all 0.3s;
  }

  .nav-bottom {
    padding: 20px 0;
    border-top: 1px solid #e4e7ed;

    .history-icon {
      width: 24px;
      height: 24px;
      margin: 0 auto;
    }
  }
}
</style>